<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Broker extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['user_id', 'commission_rate'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function commissions()
    {
        return $this->hasMany(Commission::class);
    }
}
