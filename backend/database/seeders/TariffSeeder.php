<?php

namespace Database\Seeders;

use App\Models\InsuranceCompany;
use App\Models\InsuranceType;
use App\Models\Tariff;
use Illuminate\Database\Seeder;

class TariffSeeder extends Seeder
{
    public function run(): void
    {
        $companyA = InsuranceCompany::where('name', 'СтрахПлюс')->firstOrFail();
        $companyB = InsuranceCompany::where('name', 'ГарантАсист')->firstOrFail();

        $tariffs = [
            'auto' => [
                ['name' => 'Базовый', 'base_price' => 1200, 'company' => $companyA],
                ['name' => 'Расширенный', 'base_price' => 2500, 'company' => $companyB],
            ],
            'property' => [
                ['name' => 'Базовый', 'base_price' => 800, 'company' => $companyA],
                ['name' => 'Премиум', 'base_price' => 2000, 'company' => $companyB],
            ],
            'health' => [
                ['name' => 'Базовый', 'base_price' => 1500, 'company' => $companyA],
                ['name' => 'Премиум', 'base_price' => 3500, 'company' => $companyB],
            ],
        ];

        foreach ($tariffs as $code => $items) {
            $type = InsuranceType::where('code', $code)->first();

            if (! $type) {
                continue;
            }

            foreach ($items as $item) {
                Tariff::firstOrCreate(
                    ['insurance_type_id' => $type->id, 'name' => $item['name']],
                    ['base_price' => $item['base_price'], 'company_id' => $item['company']->id]
                );
            }
        }
    }
}
