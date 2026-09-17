<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['customer'])],
            'phone' => ['required_if:role,customer', 'nullable', 'string', 'max:30'],
            'address' => ['required_if:role,customer', 'nullable', 'string', 'max:500'],
            'date_of_birth' => ['required_if:role,customer', 'nullable', 'date'],

            // Необязательно для broker по умолчанию 0, назначается позже админом
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
