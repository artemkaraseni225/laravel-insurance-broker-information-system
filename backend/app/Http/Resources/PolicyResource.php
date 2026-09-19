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
                'created_at' => $this->application->created_at,
                'insurance_data' => $this->application->insurance_data,
                'insurance_type' => [
                    'code' => $this->application->insuranceType?->code,
                    'name' => $this->application->insuranceType?->name,
                ],
                'customer' => [
                    'name' => $this->application->customer?->user?->name,
                    'email' => $this->application->customer?->user?->email,
                    'phone' => $this->application->customer?->phone,
                    'address' => $this->application->customer?->address,
                ],
                'broker' => [
                    'name' => $this->application->broker?->user?->name,
                ],
                'tariff' => [
                    'company' => [
                        'name' => $this->application->tariff?->company?->name,
                        'registration_number' => $this->application->tariff?->company?->registration_number,
                    ],
                ],
                'documents' => DocumentResource::collection($this->application->documents),
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