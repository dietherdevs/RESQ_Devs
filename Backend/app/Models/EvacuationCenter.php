<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvacuationCenter extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'location', 'contact', 'capacity', 'current', 'status'];

    public function evacuees()
    {
        return $this->hasMany(Evacuee::class);
    }
}