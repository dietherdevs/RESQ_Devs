<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Handle Registration
     */
    public function register(Request $request)
    {
        // 1. Standardize phone format FIRST so unique DB check works 100% of the time
        $phone = $request->phone;
        $phone = str_replace([' ', '-'], '', $phone); 
        if (str_starts_with($phone, '09')) {
            $phone = '63' . substr($phone, 1); 
        }

        // Re-inject the cleaned phone back into request data for the validator
        $request->merge(['formatted_phone' => $phone]);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[^A-Za-z0-9]/' // Must contain at least 1 symbol
            ],
            'formatted_phone' => 'required|string|max:20|unique:users,phone_number',
            'dob' => 'required|date|before_or_equal:' . now()->subYears(18)->format('Y-m-d'),
            'gender' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'id_image' => 'required|image|mimes:jpeg,png,jpg|max:10240',
        ], [
            // Human-friendly fallback responses
            'password.regex' => 'Your password must contain at least one special character (e.g., @, $, !, %, *, #, ?, &).',
            'dob.before_or_equal' => 'You must be at least 18 years old to register.',
            'formatted_phone.unique' => 'This phone number is already attached to an existing resident account.'
        ]);

        $imagePath = null;
        if ($request->hasFile('id_image')) {
            $imagePath = $request->file('id_image')->store('id_uploads', 'public'); 
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone_number' => $phone, 
            'dob' => $request->dob,
            'gender' => $request->gender,
            'address' => $request->address,
            'id_image_path' => $imagePath,
            'status' => 'pending',
            'is_approved' => false, 
        ]);

        $token = $user->createToken('resq-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful. Pending verification.',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    /**
     * Handle Login with Account Status Verification
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Your account is still under review by the Barangay. Please wait for approval.'
            ], 403);
        }

        $token = $user->createToken('resq-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone_number, 
                'address' => $user->address,
                'is_approved' => (bool) $user->is_approved, 
                'verified' => $user->status === 'approved'
            ],
            'token' => $token
        ]);
    }

    /**
     * Update Profile & SMS Toggle
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'firstName' => 'nullable|string',
            'lastName' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'is_approved' => 'nullable|boolean', 
        ]);

        if ($request->has('firstName') && $request->has('lastName')) {
            $user->name = trim($request->firstName . ' ' . $request->lastName);
        }
        
        if ($request->has('phone')) {
            $phone = $request->phone;
            $phone = str_replace([' ', '-'], '', $phone);
            if (str_starts_with($phone, '09')) {
                $phone = '63' . substr($phone, 1);
            }
            $user->phone_number = $phone; 
        }
        
        if ($request->has('address')) {
            $user->address = $request->address;
        }
        
        if ($request->exists('is_approved')) {
            $user->is_approved = filter_var($request->is_approved, FILTER_VALIDATE_BOOLEAN); 
            $user->status = $user->is_approved ? 'approved' : 'rejected';
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone_number,
                'address' => $user->address,
                'is_approved' => (bool) $user->is_approved,
                'verified' => $user->status === 'approved'
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}