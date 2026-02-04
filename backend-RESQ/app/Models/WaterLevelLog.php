<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WaterLevelLog extends Model
{
    use HasFactory;

    protected $table = 'water_level_logs';
    public $timestamps = false;

    protected $fillable = [
        'location',
        'level_meters',
        'status', 
        'recorded_at'
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];
}