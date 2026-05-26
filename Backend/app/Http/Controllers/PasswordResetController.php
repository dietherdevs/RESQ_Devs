<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class PasswordResetController extends Controller
{
    /**
     * Step 1: Send the password reset link via Maileroo.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Check if user exists first to give a clear frontend error
        if (!User::where('email', $request->email)->exists()) {
            return response()->json(['message' => 'We cannot find a user with that email address.'], 404);
        }

        // Laravel's built-in broker handles generating the token and sending the email
        $status = Password::broker()->sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent to your email.']);
        }

        return response()->json(['message' => 'Unable to send reset link. Please try again.'], 500);
    }

    /**
     * Step 2: Verify token and update the password.
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password has been successfully reset.']);
        }

        return response()->json(['message' => 'Invalid or expired reset token.'], 400);
    }
}