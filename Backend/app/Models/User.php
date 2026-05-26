<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role', 
        'phone',          // Added for the mutator to work flawlessly
        'phone_number',   
        'dob', 
        'gender', 
        'address', 
        'id_image_path', 
        'status',
        'is_approved',    
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_approved' => 'boolean', 
    ];

    // --------------------------------------------------
    // Mutators for Phone Syncing
    // --------------------------------------------------
    
    public function setPhoneAttribute($value)
    {
        $this->attributes['phone'] = $value;
        $this->attributes['phone_number'] = $value;
    }

    public function setPhoneNumberAttribute($value)
    {
        $this->attributes['phone_number'] = $value;
        $this->attributes['phone'] = $value;
    }

    // --------------------------------------------------
    // Role Helper Methods for easy access checks
    // --------------------------------------------------

    public function isSuperAdmin()
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isStaff()
    {
        return $this->role === 'staff';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }
}