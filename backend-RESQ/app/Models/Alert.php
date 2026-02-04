<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    use HasFactory;

    protected $table = 'alerts';

    protected $fillable = [
        'title',
        'message',
        'severity',         
        'target_street_id', 
        'status'            
    ];

    public function street()
    {
        return $this->belongsTo(Street::class, 'target_street_id');
    }
}