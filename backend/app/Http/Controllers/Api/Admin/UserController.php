<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\Broker;
use App\Models\Application;
use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $role = Role::where('name', $data['role'])->firstOrFail();

        $user = DB::transaction(function () use ($data, $role) {
            $user = User::create([
                'role_id' => $role->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'status' => 'active',
            ]);

            if ($data['role'] === 'broker') {
                Broker::create(['user_id' => $user->id, 'commission_rate' => 0]);
            } else {
                Customer::create(['user_id' => $user->id]);
            }

            return $user;
        });

        return response()->json([
            'message' => 'Пользователь создан',
            'user' => $user->load(['role', 'customer', 'broker']),
        ], 201);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        abort_if($user->role?->name === 'admin', 403, 'Администратора нельзя заблокировать.');

        $user->update(['status' => $request->validated('status')]);

        return response()->json([
            'user' => $user->fresh(['role']),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        abort_if($user->role?->name === 'admin', 403, 'Администратора нельзя удалить.');
        $adminId = $request->user()->id;

        DB::transaction(function () use ($user, $adminId) {
            if ($user->broker) {
                Application::where('broker_id', $user->broker->id)
                    ->where('status', ApplicationStatus::InReview->value)
                    ->update([
                        'broker_id' => null,
                        'status' => ApplicationStatus::New->value,
                    ]);

                Application::where('broker_id', $user->broker->id)
                    ->update(['broker_id' => null]);
                    
                $user->broker->delete();
            }

            if ($user->customer) {
                $applications = Application::where('customer_id', $user->customer->id)
                    ->where('status', '!=', ApplicationStatus::Cancelled->value)
                    ->get();

                foreach ($applications as $application) {
                    $fromStatus = $application->status?->value;
                    $application->update(['status' => ApplicationStatus::Cancelled]);
                    $application->statusHistories()->create([
                        'from_status' => $fromStatus,
                        'to_status' => ApplicationStatus::Cancelled->value,
                        'changed_by' => $adminId,
                        'note' => 'Заявка отменена из-за удаления клиента администратором',
                    ]);
                }

                $user->customer->delete();

            }

            $user->delete();
        });


        return response()->json(['message' => 'Пользователь удалён']);
    }
}
