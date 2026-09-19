<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InsuranceCompany extends Model
{
    protected $fillable = ['name', 'registration_number', 'logo_path', 'status'];

    public function tariffs()
    {
        return $this->hasMany(Tariff::class, 'company_id');
    }
}
