<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Household extends Model
{
    use HasFactory;

    // Matches your database columns from the screenshot
    protected $fillable = [
        'head_resident_id', // Links to the User
        'street_name',      // We'll use a string for simplicity for now
        'house_number',
        'total_members',
        'count_seniors',
        'count_pwds',
        'contact_number'
    ];

    public function head()
    {
        return $this->belongsTo(User::class, 'head_resident_id');
    }
}