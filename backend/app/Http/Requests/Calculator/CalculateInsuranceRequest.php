<?php

namespace App\Http\Requests\Calculator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CalculateInsuranceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'insurance_type' => ['required', Rule::in(['auto', 'property', 'health'])],
            'tariff_id' => ['required', 'integer', 'exists:tariffs,id'],
            'term_months' => ['required', 'integer', 'min:1', 'max:60'],
            'insurance_sum' => [
                'required_unless:insurance_type,health',
                'nullable',
                'numeric',
                'min:1',
            ],
            'options' => ['nullable', 'array'],
            'options.*' => ['string'],

            // auto и health считают по возрасту
            'age' => [
                'required_if:insurance_type,auto',
                'required_if:insurance_type,health',
                'nullable',
                'integer',
                'min:16',
                'max:100',
            ],

            // property считает по стоимости имущества
            'property_value' => ['required_if:insurance_type,property', 'nullable', 'numeric', 'min:0'],
        ];
    }
}
