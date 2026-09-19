<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Подтверждение оплаты {{ $policy->policy_number }}</title>
    <style>
        @page { margin: 36px; }
        body { color: #1f2937; font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h1 { margin: 0 0 6px; font-size: 22px; }
        h2 { border-bottom: 1px solid #d1d5db; font-size: 14px; margin: 22px 0 8px; padding-bottom: 5px; }
        .muted { color: #6b7280; }
        .status { color: #166534; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; }
        td { padding: 7px 4px; vertical-align: top; }
        td:first-child { color: #6b7280; width: 36%; }
        .header { border-bottom: 2px solid #111827; padding-bottom: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Подтверждение оплаты</h1>
        <div class="muted">Страховой полис № {{ $policy->policy_number }}</div>
    </div>

    <h2>Платёж</h2>
    <table>
        <tr><td>Статус</td><td class="status">{{ $payment->status }}</td></tr>
        <tr><td>Сумма</td><td>{{ $payment->amount }} MDL</td></tr>
        <tr><td>Способ оплаты</td><td>{{ $payment->payment_method }}</td></tr>
        <tr><td>Номер карты</td><td>**** **** **** 4242</td></tr>
        <tr><td>Дата оплаты</td><td>{{ $payment->paid_at?->format('d.m.Y H:i') ?? '—' }}</td></tr>
        <tr><td>ID транзакции</td><td>TXN-{{ $payment->paid_at?->valueOf() ?? now()->valueOf() }}-{{ str_pad((string) $payment->id, 3, '0', STR_PAD_LEFT) }}</td></tr>
    </table>

    <h2>Клиент</h2>
    <table>
        <tr><td>ФИО</td><td>{{ $policy->application->customer?->user?->name ?? '—' }}</td></tr>
        <tr><td>Email</td><td>{{ $policy->application->customer?->user?->email ?? '—' }}</td></tr>
        <tr><td>Телефон</td><td>{{ $policy->application->customer?->phone ?? '—' }}</td></tr>
    </table>
</body>
</html>
