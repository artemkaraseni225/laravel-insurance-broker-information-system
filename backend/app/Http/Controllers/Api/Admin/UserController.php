<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\Broker;
use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{

    public function updateRole(UpdateUserRoleRequest $request, User $user)
    {
        $newRoleName = $request->validated('role');
        $newRole = Role::where('name', $newRoleName)->firstOrFail();

        DB::transaction(function () use ($user, $newRole, $newRoleName) {
            $user->update(['role_id' => $newRole->id]);

            if ($newRoleName === 'customer' && ! $user->customer) {
                Customer::create(['user_id' => $user->id]);
            }

            if ($newRoleName === 'broker' && ! $user->broker) {
                Broker::create(['user_id' => $user->id, 'commission_rate' => 0]);
            }
        });

        return response()->json([
            'user' => $user->fresh(['role', 'customer', 'broker']),
        ]);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        $user->update(['status' => $request->validated('status')]);

        return response()->json([
            'user' => $user->fresh(['role']),
        ]);
    }
}
