<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordOTP;
use Carbon\Carbon;
use Illuminate\Validation\Rules\Password; 

class AuthController extends Controller
{
    // --- REGISTER NEW USER (Residents) ---
    public function register(Request $request) {
        
        // 1. Validate
        $fields = $request->validate([
            'firstName'    => 'required|string',
            'lastName'     => 'required|string',
            'username'     => 'required|string|unique:users,username',
            'email'        => 'required|string|email|unique:users,email',
            'password'     => [
                'required',
                'confirmed', 
                Password::min(8)
                    ->mixedCase() 
                    ->numbers()   
                    ->symbols()   
            ],
            'phone_number' => 'required|string',
            'birthdate'    => 'required|date',
            'address'      => 'required|string',
            'gender'       => 'required|string',
        ]);

        // 2. Create the User
        $user = User::create([
            'firstName'    => $fields['firstName'],
            'lastName'     => $fields['lastName'],
            'username'     => $fields['username'],
            'email'        => $fields['email'], 
            'password'     => Hash::make($fields['password']),
            'phone_number' => $fields['phone_number'],
            'birthdate'    => $fields['birthdate'],
            'address'      => $fields['address'],
            'gender'       => $fields['gender'],
            'role'         => 'resident', 
            'is_verified'  => false        
        ]);

        // 3. Auto Login
        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // --- LOGIN (Supports Username OR Email) ---
    public function login(Request $request) {
        $fields = $request->validate([
            'username' => 'required|string', 
            'password' => 'required|string'
        ]);

        $loginInput = $fields['username'];

        // 1. Check if user exists (Search in 'username' OR 'email' columns)
        $user = User::where('username', $loginInput)
                    ->orWhere('email', $loginInput)
                    ->first();

        // Specific Error: User Not Found
        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }

        // Specific Error: Password Wrong
        if (!Hash::check($fields['password'], $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 401);
        }

        // 2. Generate Token
        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // --- LOGOUT ---
    public function logout(Request $request) {
        auth()->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    // ==========================================
    //       FORGOT PASSWORD FUNCTIONS
    // ==========================================

    // 1. SEND OTP CODE
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        // Generate 6-digit code
        $code = rand(100000, 999999);

        // Store in DB 
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $code,
                'created_at' => Carbon::now()
            ]
        );

        // Send Email
        try {
            Mail::to($request->email)->send(new ResetPasswordOTP($code));
            return response()->json(['message' => 'Verification code sent']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send email. Check SMTP settings.'], 500);
        }
    }

    // 2. VERIFY OTP CODE
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|numeric'
        ]);

        $record = DB::table('password_reset_tokens')
                    ->where('email', $request->email)
                    ->where('token', $request->code)
                    ->first();

        // Check validity (Exists + Not older than 10 mins)
        if (!$record || Carbon::parse($record->created_at)->addMinutes(10)->isPast()) {
            return response()->json(['message' => 'Invalid or expired code'], 400);
        }

        return response()->json(['message' => 'Code verified']);
    }

    // 3. RESET PASSWORD FINAL STEP
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|numeric',
            'password' => [
                'required', 
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols()
            ]
        ]);

        // Double check code before resetting
        $record = DB::table('password_reset_tokens')
                    ->where('email', $request->email)
                    ->where('token', $request->code)
                    ->first();

        if (!$record || Carbon::parse($record->created_at)->addMinutes(10)->isPast()) {
            return response()->json(['message' => 'Invalid or expired code'], 400);
        }

        // Update User
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successfully']);
    }

    // ==========================================
    //      ✅ NEW: CREATE ADMIN / STAFF
    //      (With Error Debugging Added)
    // ==========================================
    public function createAdmin(Request $request)
    {
        try {
            // 1. Validate incoming data
            $fields = $request->validate([
                'firstName' => 'required|string',
                'lastName' => 'required|string',
                'username' => 'required|string|unique:users,username',
                'password' => 'required|string|confirmed', 
                'role' => 'required|in:admin,staff', 
                'phoneNumber' => 'required|string',
                // Optional fields
                'birthdate' => 'nullable',
                'address' => 'nullable',
                'gender' => 'nullable',
            ]);

            // 2. Create the User
            // Note: We auto-generate a dummy email because your DB requires unique emails
            $user = User::create([
                'firstName' => $fields['firstName'],
                'lastName' => $fields['lastName'],
                'username' => $fields['username'],
                'email' => $fields['username'] . '@resq.local', 
                'phone_number' => $fields['phoneNumber'], // Make sure this matches your DB column (phone_number vs phoneNumber)
                'password' => Hash::make($fields['password']),
                'role' => $fields['role'],
                'birthdate' => $fields['birthdate'] ?? '2000-01-01',
                'address' => $fields['address'] ?? 'Office',
                'gender' => $fields['gender'] ?? 'N/A',
                'is_verified' => true, 
            ]);

            return response()->json([
                'message' => 'Account created successfully',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            // 🛑 THIS IS THE FIX:
            // Instead of crashing silently with "500", this sends the error message back to the frontend.
            return response()->json([
                'message' => 'Server Error: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}