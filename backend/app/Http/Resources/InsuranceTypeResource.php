<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InsuranceTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            // Поля формы для этого типа НЕ приходят с бэка — они
            // захардкожены во фронтенде. Здесь только справочные данные.
            'tariffs' => TariffResource::collection($this->whenLoaded('tariffs')),
        ];
    }
}
