<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Street extends Model
{
    use HasFactory;

    protected $table = 'streets';
    public $timestamps = false; 

    protected $fillable = [
        'name',
        'barangay_zone',
        'risk_level'
    ];

    public function residents()
    {
        return $this->hasMany(Resident::class);
    }

    public function households()
    {
        return $this->hasMany(Household::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class, 'target_street_id');
    }
}