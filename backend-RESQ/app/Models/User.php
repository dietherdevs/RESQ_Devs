<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'username',
        'firstName',
        'lastName',
        'email',
        'password',
        'phone_number',
        'birthdate',
        'address',
        'gender',
        'role',
        'is_verified',
        'profile_image',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Relationship to the Resident profile
     */
    public function residentProfile()
    {
        // Specifying 'resident_id' as the foreign key to match your schema logic
        return $this->hasOne(Resident::class, 'resident_id');
    }

    /**
     * Relationship to Evacuation Records
     * Updated to use 'resident_id' instead of the default 'user_id'
     */
    public function evacuationRecords() 
    {
        // By specifying 'resident_id', we fix the "Undefined column" error you saw in Tinker
        return $this->hasMany(EvacuationRecord::class, 'resident_id');
    }
    
    /**
     * Relation for Household management
     */
    public function household()
    {
        return $this->belongsTo(Household::class, 'household_id');
    }
}