<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        // DB::transaction: если создание упадёт,
        // откатится и созданный users — не останется "голого" юзера без профиля
        $user = DB::transaction(function () use ($data) {
            $role = Role::where('name', 'customer')->firstOrFail();

            $user = User::create([
                'role_id' => $role->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

                Customer::create([
                    'user_id' => $user->id,
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                    'date_of_birth' => $data['date_of_birth'],
                ]);
            

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load(['role', 'customer', 'broker']),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Неверный email или пароль.'],
            ]);
        }

        $user = User::where('email', $credentials['email'])->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load(['role', 'customer', 'broker']),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Выход выполнен']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load(['role', 'customer', 'broker']),
        ]);
    }
}
