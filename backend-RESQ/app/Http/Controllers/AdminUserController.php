<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    // 1. Get all Admins & Staff (Corrected to fetch admins, not residents)
    public function index()
    {
        // Fetch only admins/staff/superadmins
        $users = User::whereIn('role', ['staff', 'admin', 'superadmin'])
                     ->orderBy('created_at', 'desc')
                     ->get();
        
        return response()->json($users);
    }

    // 2. Toggle Verification Status
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->is_verified = !$user->is_verified;
        $user->save();

        $status = $user->is_verified ? 'Verified' : 'Deactivated';
        return response()->json(['message' => "User {$status} successfully!", 'user' => $user]);
    }

    // 3. Reset Password
    public function resetPassword($id)
    {
        $user = User::findOrFail($id);
        $defaultPass = 'resq1234'; 
        $user->password = Hash::make($defaultPass);
        $user->save();

        return response()->json(['message' => "Password reset to: $defaultPass"]);
    }

    // ✅ 4. UPDATE USER (This was missing!)
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Validate
        $fields = $request->validate([
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'phoneNumber' => 'required|string',
            'role' => 'required|in:staff,admin,superadmin,resident', 
            // Unique username, but ignore current user's ID
            'username' => 'required|string|unique:users,username,' . $id, 
        ]);

        // Update Database
        $user->update([
            'firstName' => $fields['firstName'],
            'lastName' => $fields['lastName'],
            'phone_number' => $fields['phoneNumber'], 
            'role' => $fields['role'],
            'username' => $fields['username'],
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }
}