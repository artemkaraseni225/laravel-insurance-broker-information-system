<?php

namespace App\Http\Requests\Application;

use App\Http\Requests\Calculator\CalculateInsuranceRequest;
use Illuminate\Validation\Rule;

// Расширенные поля полной заявки (доступны только авторизованным
// клиентам — гейтинг на фронте через AuthContext). Заменяют собой
// предыдущий черновой набор полей на более реалистичный молдавский
// страховой контекст (IDNP, VIN/техпаспорт и т.д.).
class CreateApplicationRequest extends CalculateInsuranceRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            // auto
            'license_plate' => ['required_if:insurance_type,auto', 'nullable', 'string', 'max:20'],
            'vin_or_tech_passport' => ['required_if:insurance_type,auto', 'nullable', 'string', 'max:50'],
            'engine_volume' => ['required_if:insurance_type,auto', 'nullable', 'integer', 'min:50', 'max:10000'],
            'driving_experience_years' => ['required_if:insurance_type,auto', 'nullable', 'integer', 'min:0', 'max:80'],

            // property
            'property_address' => ['required_if:insurance_type,property', 'nullable', 'string', 'max:500'],
            'property_type' => ['required_if:insurance_type,property', 'nullable', Rule::in(['apartment', 'house'])],
            'area_sqm' => ['required_if:insurance_type,property', 'nullable', 'numeric', 'min:1', 'max:10000'],
            'has_risk_factors' => ['required_if:insurance_type,property', 'boolean'],

            // health
            'date_of_birth' => ['required_if:insurance_type,health', 'nullable', 'date', 'before:today'],

            // общее для auto и health — молдавский персональный код,
            // 13 цифр (для юр. привязки документа к гражданину)
            'idnp' => ['required_if:insurance_type,auto,health', 'nullable', 'digits:13'],
        ]);
    }
}
