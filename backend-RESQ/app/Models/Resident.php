<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    use HasFactory;

    protected $table = 'residents';

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'street_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'valid_id_path'
    ];

    public function street()
    {
        return $this->belongsTo(Street::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function household()
    {
        return $this->hasOne(Household::class, 'head_resident_id');
    }
    
    public function evacuationRecords()
    {
        return $this->hasMany(EvacuationRecord::class);
    }
}