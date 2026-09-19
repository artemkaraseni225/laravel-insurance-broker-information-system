<?php

namespace App\Services\Insurance;

use App\Models\Application;
use App\Models\Policy;

class PolicyService
{
    public function createFromApplication(Application $application): Policy
    {
        return Policy::create([
            'application_id' => $application->id,
            'policy_number' => $this->generatePolicyNumber($application),
            'status' => 'pending_payment',
            // Даты действия — nullable, проставим при активации после
            // оплаты (следующий шаг), не при approval
            'premium' => $application->calculated_price,
            'insurance_sum' => $this->insuranceSum($application),
        ]);
    }

    private function insuranceSum(Application $application): float
    {
        return data_get($application->insurance_data, 'insurance_type') === 'health'
            ? 250000
            : (float) data_get($application->insurance_data, 'insurance_sum');
    }

    private function generatePolicyNumber(Application $application): string
    {
        // application_id уникален и уже гарантирует уникальность номера —
        // не нужен отдельный счётчик или UUID
        return sprintf('POL-%s-%06d', now()->format('Y'), $application->id);
    }
}
