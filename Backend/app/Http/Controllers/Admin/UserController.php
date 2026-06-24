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
                if ($user->id_image_path) {
                    // 1. Get standard asset URL
                    $rawUrl = asset('storage/' . $user->id_image_path);
                    
                    // 2. FORCE upgrade to secure HTTPS to bypass Netlify's mixed-content block!
                    $user->id_image_url = str_replace('http://', 'https://', $rawUrl);
                } else {
                    $user->id_image_url = null;
                }
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
        $user->is_approved = true; // BUGFIX: Synced the boolean flag!
        $user->save();

        return response()->json([
            'message' => "Account for {$user->name} has been approved."
        ]);
    }

    /**
     * Reject a fraudulent registration
     * Now updates status to 'rejected' instead of deleting, keeping it in history
     */
    public function rejectUser($id)
    {
        $user = User::findOrFail($id);
        
        $user->status = 'rejected';
        $user->is_approved = false; // BUGFIX: Synced the boolean flag!
        $user->save();

        return response()->json([
            'message' => "Registration for {$user->name} was rejected and moved to history."
        ]);
    }
}