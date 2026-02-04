<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvacuationCenter extends Model
{
    use HasFactory;

    protected $table = 'evacuation_centers';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'location',
        'capacity',
        'contact_number',
        'status'
    ];

    public function records()
    {
        return $this->hasMany(EvacuationRecord::class, 'center_id');
    }
}