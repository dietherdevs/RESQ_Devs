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
    // Fetch all internal platform accounts
    public function index()
    {
        $admins = User::whereIn('role', ['admin', 'super_admin', 'staff'])
            ->select('id', 'name', 'email', 'phone_number as phone', 'address as barangay', 'role', 'status', 'created_at')
            ->get()
            ->map(function($admin) {
                $admin->createdAt = $admin->created_at->format('m/d/Y');
                $admin->active = $admin->status === 'approved'; 
                $admin->role = $admin->role === 'super_admin' ? 'superadmin' : $admin->role;
                return $admin;
            });
            
        return response()->json($admins);
    }

    // Provision new user & blast Maileroo Setup link
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,superadmin,staff',
        ]);

        $dbRole = $request->role === 'superadmin' ? 'super_admin' : $request->role;

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make(Str::random(16)), 
            'phone_number' => $request->phone,
            'address' => $request->barangay,
            'role' => $dbRole,
            'status' => $request->active ? 'approved' : 'inactive', 
            'is_approved' => true, 
        ]);

        Password::broker()->sendResetLink(['email' => $admin->email]);

        $admin->createdAt = $admin->created_at->format('m/d/Y');
        $admin->phone = $admin->phone_number;
        $admin->barangay = $admin->address;
        $admin->active = $admin->status === 'approved';
        $admin->role = $admin->role === 'super_admin' ? 'superadmin' : $admin->role;

        return response()->json([
            'message' => 'Account dispatched. An email invite has been sent to set up their secure password.',
            'admin' => $admin
        ], 201);
    }

    // Update account profile & permissions
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

    public function toggleStatus(Request $request, $id)
    {
        $admin = User::findOrFail($id);
        $admin->status = $request->active ? 'approved' : 'inactive';
        $admin->save();

        return response()->json(['message' => 'Status locked']);
    }

    public function destroy($id)
    {
        $admin = User::findOrFail($id);
        $admin->delete();

        return response()->json(['message' => 'Account destroyed']);
    }
}