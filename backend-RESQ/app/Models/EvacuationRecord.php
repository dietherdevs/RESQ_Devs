<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvacuationRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'resident_id',        // Links to users.id
        'manual_head_family', 
        'center_id',          // Links to evacuation_centers.id
        'member_count', 
        'pwd_count', 
        'senior_count', 
        'pregnant_count', 
        'baby_count', 
        'phone_number', 
        'address', 
        'arrival_time',
        'departure_time',
        'status',
        'remarks'
    ];

    /**
     * Relationship to the User (Resident)
     * We specify 'resident_id' to match your fillable array.
     */
    public function resident()
    {
        // Explicitly naming 'resident_id' prevents Laravel from looking for 'user_id'.
        return $this->belongsTo(User::class, 'resident_id'); 
    }

    /**
     * Relationship to the Evacuation Center
     */
    public function center()
    {
        return $this->belongsTo(EvacuationCenter::class, 'center_id');
    }

    protected $casts = [
    'arrival_time' => 'datetime',
    'departure_time' => 'datetime',
];
}