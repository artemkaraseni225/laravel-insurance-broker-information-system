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
        @foreach (($policy->application->insurance_data ?? []) as $key => $value)
            @if ($key !== 'options' && $value !== null && $value !== '')
                <tr>
                    <td>{{ str_replace('_', ' ', ucfirst($key)) }}</td>
                    <td>{{ is_bool($value) ? ($value ? 'Да' : 'Нет') : (is_array($value) ? implode(', ', $value) : $value) }}</td>
                </tr>
            @endif
        @endforeach
    </table>
</body>
</html>
