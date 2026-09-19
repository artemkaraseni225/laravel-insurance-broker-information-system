<?php

namespace Database\Seeders;

use App\Models\InsuranceCompany;
use Illuminate\Database\Seeder;

class InsuranceCompanySeeder extends Seeder
{
    // Названия вымышленные — намеренно не используем реальные
    // страховые компании с придуманными ценами.
    public function run(): void
    {
        $companies = [
            [
                'name' => 'СтрахПлюс',
                'registration_number' => '1003600001234',
            ],
            [
                'name' => 'ГарантАсист',
                'registration_number' => '1003600005678',
            ],
        ];

        foreach ($companies as $company) {
            InsuranceCompany::updateOrCreate(
                ['name' => $company['name']],
                [
                    'registration_number' => $company['registration_number'],
                ]
            );
        }
    }
}