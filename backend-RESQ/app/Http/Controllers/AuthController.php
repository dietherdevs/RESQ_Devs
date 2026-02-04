<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
// --- NEW IMPORTS FOR FORGOT PASSWORD ---
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordOTP;
use Carbon\Carbon;

class AuthController extends Controller
{
    // --- REGISTER NEW USER ---
    public function register(Request $request) {
        
        // 1. Validate
        $fields = $request->validate([
            'firstName'    => 'required|string',
            'lastName'     => 'required|string',
            'username'     => 'required|string|unique:users,username',
            
            // Allow email to be optional, but unique if provided
            'email'        => 'nullable|string|email|unique:users,email',
            
            'password'     => 'required|string|confirmed',
            'phone_number' => 'required|string',
            'birthdate'    => 'required|date',
            'address'      => 'required|string',
            'gender'       => 'required|string',
        ]);

        // 2. Handle Email (Use provided email OR generate a placeholder)
        $finalEmail = $request->email ? $request->email : ($fields['username'] . '@resq.local');

        // 3. Create the User
        $user = User::create([
            'firstName'    => $fields['firstName'],
            'lastName'     => $fields['lastName'],
            'username'     => $fields['username'],
            'email'        => $finalEmail, // Use the logic above
            'password'     => Hash::make($fields['password']),
            'phone_number' => $fields['phone_number'],
            'birthdate'    => $fields['birthdate'],
            'address'      => $fields['address'],
            'gender'       => $fields['gender'],
            'role'         => 'resident', 
            'is_verified'  => true        
        ]);

        // 4. Auto Login
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
            'username' => 'required|string', // This input can be username OR email
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
    //      NEW FORGOT PASSWORD FUNCTIONS
    // ==========================================

    // 1. SEND OTP CODE
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        // Generate 6-digit code
        $code = rand(100000, 999999);

        // Store in DB (Standard Laravel password_reset_tokens table)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $code, // We store the numeric code in the 'token' column
                'created_at' => Carbon::now()
            ]
        );

        // Send Email using the Mailable created earlier
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
            'password' => 'required|min:8|confirmed' // Requires password_confirmation field
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
}