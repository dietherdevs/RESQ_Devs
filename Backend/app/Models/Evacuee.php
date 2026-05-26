<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evacuee extends Model
{
    use HasFactory;
protected $fillable = ['head', 'phone', 'address', 'barangay', 'center', 'total', 'pwd', 'seniors', 'pregnant', 'babies', 'status'];

    public function center()
    {
        return $this->belongsTo(EvacuationCenter::class, 'evacuation_center_id');
    }
}