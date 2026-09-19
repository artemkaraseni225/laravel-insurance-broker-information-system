<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Страховой полис {{ $policy->policy_number }}</title>
    <style>
        @page { margin: 36px; }
        body { color: #1f2937; font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h1 { margin: 0 0 6px; font-size: 22px; }
        h2 { border-bottom: 1px solid #d1d5db; font-size: 14px; margin: 22px 0 8px; padding-bottom: 5px; }
        .muted { color: #6b7280; }
        .status { color: #166534; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; }
        td { padding: 6px 4px; vertical-align: top; }
        td:first-child { color: #6b7280; width: 32%; }
        .header { border-bottom: 2px solid #111827; padding-bottom: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Страховой полис</h1>
        <div class="muted">Номер полиса: {{ $policy->policy_number }}</div>
    </div>

    <h2>Основная информация</h2>
    <table>
        <tr><td>Статус</td><td class="status">{{ $policy->status }}</td></tr>
        <tr><td>Тип страхования</td><td>{{ $policy->application->insuranceType?->name ?? '—' }}</td></tr>
        <tr><td>Дата начала</td><td>{{ $policy->start_date?->format('d.m.Y') ?? '—' }}</td></tr>
        <tr><td>Дата окончания</td><td>{{ $policy->end_date?->format('d.m.Y') ?? '—' }}</td></tr>
        <tr><td>Страховая премия</td><td>{{ $policy->premium }} MDL</td></tr>
    </table>

    <h2>Страхователь</h2>
    <table>
        <tr><td>ФИО</td><td>{{ $policy->application->customer?->user?->name ?? '—' }}</td></tr>
        <tr><td>Email</td><td>{{ $policy->application->customer?->user?->email ?? '—' }}</td></tr>
        <tr><td>Телефон</td><td>{{ $policy->application->customer?->phone ?? '—' }}</td></tr>
        <tr><td>Адрес</td><td>{{ $policy->application->customer?->address ?? '—' }}</td></tr>
    </table>

    <h2>Страховщик</h2>
    <table>
        <tr><td>Компания</td><td>{{ $policy->application->tariff?->company?->name ?? '—' }}</td></tr>
        <tr><td>Регистрационный номер</td><td>{{ $policy->application->tariff?->company?->registration_number ?? '—' }}</td></tr>
    </table>

    <h2>Застрахованный объект</h2>
    <table>
        @php
            $fieldLabels = [
                'insurance_sum' => 'Страховая сумма',
                'age' => 'Возраст',
                'car_brand' => 'Марка автомобиля',
                'car_model' => 'Модель автомобиля',
                'license_plate' => 'Государственный номер',
                'vin_or_tech_passport' => 'VIN-код или номер техпаспорта',
                'engine_volume' => 'Объём двигателя',
                'driving_experience_years' => 'Стаж вождения',
                'property_value' => 'Оценочная стоимость имущества',
                'property_address' => 'Адрес имущества',
                'property_type' => 'Тип недвижимости',
                'area_sqm' => 'Площадь',
                'has_risk_factors' => 'Есть риски',
                'date_of_birth' => 'Дата рождения',
                'idnp' => 'IDNP',
                'term_months' => 'Срок страхования',
                'personal_data_consent' => 'Согласие на обработку персональных данных',
            ];
        @endphp
        @foreach (($policy->application->insurance_data ?? []) as $key => $value)
            @if (!in_array($key, ['options', 'tariff_id', 'insurance_type'], true) && $value !== null && $value !== '')
                <tr>
                    <td>{{ $fieldLabels[$key] ?? $key }}</td>
                    <td>
                        @if (is_bool($value))
                            {{ $value ? 'Да' : 'Нет' }}
                        @elseif ($key === 'property_type')
                            {{ $value === 'apartment' ? 'Квартира' : ($value === 'house' ? 'Частный дом' : $value) }}
                        @elseif ($key === 'area_sqm')
                            {{ $value }} кв. м
                        @elseif ($key === 'engine_volume')
                            {{ $value }} см³
                        @elseif ($key === 'driving_experience_years')
                            {{ $value }} лет
                        @elseif ($key === 'term_months')
                            {{ $value }} мес.
                        @elseif (is_array($value))
                            {{ implode(', ', $value) }}
                        @else
                            {{ $value }}
                        @endif
                    </td>
                </tr>
            @endif
        @endforeach
    </table>
</body>
</html>
