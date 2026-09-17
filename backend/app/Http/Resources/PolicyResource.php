<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PolicyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $payment = $this->payments->sortByDesc('paid_at')->first();

        return [
            'id' => $this->id,
            'policy_number' => $this->policy_number,
            'status' => $this->status,
            'premium' => $this->premium,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'application' => [
                'id' => $this->application->id,
                'insurance_data' => $this->application->insurance_data,
                'insurance_type' => [
                    'name' => $this->application->insuranceType?->name,
                ],
                'customer' => [
                    'name' => $this->application->customer?->user?->name,
                    'email' => $this->application->customer?->user?->email,
                    'phone' => $this->application->customer?->phone,
                    'address' => $this->application->customer?->address,
                ],
                'tariff' => [
                    'company' => [
                        'name' => $this->application->tariff?->company?->name,
                    ],
                ],
            ],
            'payment' => $payment ? [
                'status' => $payment->status,
                'method' => $payment->payment_method,
                'paid_at' => $payment->paid_at,
                'transaction_id' => $payment->id,
            ] : null,
        ];
    }
}