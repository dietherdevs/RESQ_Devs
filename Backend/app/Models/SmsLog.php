<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sender_role',
        'message',
        'recipients_count',
        'status'
    ];

    // Establish the relationship to the User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}