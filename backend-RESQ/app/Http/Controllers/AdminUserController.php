<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    // 1. Get all Residents
    public function index()
    {
        // Fetch only residents, ordered by newest first
        $users = User::where('role', 'resident')
                     ->orderBy('created_at', 'desc')
                     ->get();
        
        return response()->json($users);
    }

    // 2. Toggle Verification Status (Active/Blocked)
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        
        // Flip the status
        $user->is_verified = !$user->is_verified;
        $user->save();

        $status = $user->is_verified ? 'Verified' : 'Deactivated';
        return response()->json(['message' => "User {$status} successfully!", 'user' => $user]);
    }

    // 3. Reset Password (to default)
    public function resetPassword($id)
    {
        $user = User::findOrFail($id);
        
        // Reset to a standard default password
        $defaultPass = 'resq1234'; 
        $user->password = Hash::make($defaultPass);
        $user->save();

        return response()->json(['message' => "Password reset to: $defaultPass"]);
    }
}