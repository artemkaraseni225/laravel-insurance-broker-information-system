<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Policy extends Model
{
    protected $fillable = [
        'application_id',
        'policy_number',
        'status',
        'start_date',
        'end_date',
        'premium',
        'insurance_sum',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'insurance_sum' => 'decimal:2',
        ];
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function commission()
    {
        return $this->hasOne(Commission::class);
    }
}
