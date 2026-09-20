<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\Broker;
use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

    public function destroy(User $user)
    {
        abort_if($user->role?->name === 'admin', 403, 'Администратора нельзя удалить.');

        $user->delete();

        return response()->json(['message' => 'Пользователь удалён']);
    }
}
