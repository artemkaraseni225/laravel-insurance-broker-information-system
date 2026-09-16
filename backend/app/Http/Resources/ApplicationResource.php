<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'calculated_price' => $this->calculated_price,
            'insurance_data' => $this->insurance_data,
            // Нужно брокеру, чтобы понимать, чья это заявка —
            // для клиента, смотрящего свою же заявку, тоже безвредно
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->user?->name,
                'email' => $this->customer->user?->email,
                'phone' => $this->customer->phone,
            ]),
            'insurance_type' => $this->whenLoaded('insuranceType', fn () => [
                'code' => $this->insuranceType->code,
                'name' => $this->insuranceType->name,
            ]),
            'tariff' => $this->whenLoaded('tariff', fn () => [
                'id' => $this->tariff->id,
                'name' => $this->tariff->name,
                'company' => $this->tariff->relationLoaded('company') && $this->tariff->company
                    ? ['name' => $this->tariff->company->name]
                    : null,
            ]),
            'documents' => DocumentResource::collection($this->whenLoaded('documents')),
            'status_history' => ApplicationStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
            'created_at' => $this->created_at,
        ];
    }
}
