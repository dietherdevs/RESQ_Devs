<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * List ALL users (Pending, Approved, and Rejected) for History
     */
    public function getAllUsers()
    {
        $users = User::where('role', 'user') // Only fetch residents, not other admins
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                // Attach the full URL for the ID image
                $user->id_image_url = $user->id_image_path 
                    ? asset('storage/' . $user->id_image_path) 
                    : null;
                return $user;
            });

        return response()->json($users);
    }

    /**
     * Approve a resident's account
     */
    public function approveUser($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'approved';
        $user->save();

        return response()->json([
            'message' => "Account for {$user->name} has been approved."
        ]);
    }

    /**
     * Reject a fraudulent registration
     * (UPDATED: Now updates status to 'rejected' instead of deleting, keeping it in history)
     */
    public function rejectUser($id)
    {
        $user = User::findOrFail($id);
        
        $user->status = 'rejected';
        $user->save();

        return response()->json([
            'message' => "Registration for {$user->name} was rejected and moved to history."
        ]);
    }
}