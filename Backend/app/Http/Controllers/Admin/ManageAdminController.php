<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;

class ManageAdminController extends Controller
{
    // Fetch all admins and superadmins
    public function index()
    {
        $admins = User::whereIn('role', ['admin', 'super_admin', 'staff'])
            ->select('id', 'name', 'email', 'phone_number as phone', 'address as barangay', 'role', 'status', 'created_at')
            ->get()
            ->map(function($admin) {
                $admin->createdAt = $admin->created_at->format('m/d/Y');
                $admin->active = $admin->status === 'approved'; // Maps DB status to frontend Active toggle
                $admin->role = $admin->role === 'super_admin' ? 'superadmin' : $admin->role;
                return $admin;
            });
            
        return response()->json($admins);
    }

    // CREATE new admin and send them a password setup link
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,superadmin,staff',
        ]);

        // Map frontend role to DB role
        $dbRole = $request->role === 'superadmin' ? 'super_admin' : $request->role;

        // Create the user with a secure random password (they overwrite this via the email link)
        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make(Str::random(16)), 
            'phone_number' => $request->phone,
            'address' => $request->barangay,
            'role' => $dbRole,
            'status' => $request->active ? 'approved' : 'inactive', // Uses existing status column
            'is_approved' => true, // SMS enabled by default
        ]);

        // Send the Maileroo Reset Password Link (Setup Link)
        Password::broker()->sendResetLink(['email' => $admin->email]);

        // Format for frontend
        $admin->createdAt = $admin->created_at->format('m/d/Y');
        $admin->phone = $admin->phone_number;
        $admin->barangay = $admin->address;
        $admin->active = $admin->status === 'approved';
        $admin->role = $admin->role === 'super_admin' ? 'superadmin' : $admin->role;

        return response()->json([
            'message' => 'Admin created successfully. An email has been sent for them to set their password.',
            'admin' => $admin
        ], 201);
    }

    // Update existing admin details
    public function update(Request $request, $id)
    {
        $admin = User::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'role' => 'required|in:admin,superadmin,staff',
        ]);

        $dbRole = $request->role === 'superadmin' ? 'super_admin' : $request->role;

        $admin->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone,
            'address' => $request->barangay,
            'role' => $dbRole,
            'status' => $request->active ? 'approved' : 'inactive',
        ]);

        $admin->createdAt = $admin->created_at->format('m/d/Y');
        $admin->phone = $admin->phone_number;
        $admin->barangay = $admin->address;
        $admin->active = $admin->status === 'approved';
        $admin->role = $admin->role === 'super_admin' ? 'superadmin' : $admin->role;

        return response()->json($admin);
    }

    // Toggle active status
    public function toggleStatus(Request $request, $id)
    {
        $admin = User::findOrFail($id);
        $admin->status = $request->active ? 'approved' : 'inactive';
        $admin->save();

        return response()->json(['message' => 'Status updated']);
    }

    // Delete admin
    public function destroy($id)
    {
        $admin = User::findOrFail($id);
        $admin->delete();

        return response()->json(['message' => 'Admin deleted']);
    }
}