<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FloodLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'obscd', 
        'water_level', 
        'status', 
        'fetched_at', 
    ];

    protected $casts = [
        'water_level' => 'decimal:2',
        'fetched_at'  => 'datetime', // This allows us to use diffInMinutes()
    ];
}