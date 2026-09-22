<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
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
            'role' => ['required', Rule::in(['customer', 'broker'])],
            'phone' => ['exclude_unless:role,customer', 'required', 'string', 'max:30'],
            'address' => ['exclude_unless:role,customer', 'required', 'string', 'max:500'],
            'date_of_birth' => ['exclude_unless:role,customer', 'required', 'date'],
        ];
    }
}
