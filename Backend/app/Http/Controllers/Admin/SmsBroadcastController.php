<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\SmsLog; 
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; 

class SmsBroadcastController extends Controller
{
    // Dynamically count approved users for the React Dropdown
    public function getRecipientStats()
    {
        // 1. Get the total count of all approved users with a phone number
        $totalActive = User::where('is_approved', true)
            ->whereNotNull('phone_number')
            ->count();

        // 2. Group the users by their specific Address (matching your Postgres schema)
        $addressGroups = User::select('address', DB::raw('count(*) as count'))
            ->where('is_approved', true)
            ->whereNotNull('phone_number')
            ->whereNotNull('address')
            ->groupBy('address')
            ->get();

        // 3. Format it exactly how React expects it
        $recipients = [
            [
                'id' => 'all', 
                'label' => 'All Registered Users', 
                'count' => $totalActive,
                'target' => 'all'
            ]
        ];

        foreach ($addressGroups as $group) {
            $recipients[] = [
                'id' => strtolower(str_replace(' ', '-', $group->address)),
                'label' => $group->address, // Displays the raw address from DB
                'count' => $group->count,
                'target' => $group->address
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $recipients
        ]);
    }

    public function broadcast(Request $request)
    {
        // 1. Get the currently logged-in user
        $currentUser = Auth::user();

        // 2. Role Check: Allow SuperAdmin, Admin, and Staff only
        $role = $currentUser ? strtolower($currentUser->role) : null;
        $authorizedRoles = array('super_admin', 'admin', 'staff');
        
        if (!$currentUser || !in_array($role, $authorizedRoles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Only Staff, Admin, or SuperAdmin can broadcast alerts.'
            ], 403);
        }

        // 3. Validate the message and target group
        $request->validate([
            'message' => 'required|string|max:280',
            'target_group' => 'required|string'
        ]);

        $message = $request->message;

        // 4. Fetch approved residents based on the selected dropdown group
        $query = User::where('is_approved', true)->whereNotNull('phone_number');
        
        if ($request->target_group !== 'all') {
            // Target the 'address' column instead of 'barangay'
            $query->where('address', $request->target_group);
        }
        
        $residents = $query->get();

        if ($residents->isEmpty()) {
            return response()->json(['status' => 'error', 'message' => 'No recipients found in this group.'], 422);
        }

        $sentCount = 0;
        $lastError = null; // Track PhilSMS response payloads if they fail

        // 5. Dispatch SMS via PhilSMS (UPDATED TO USE EXACT .ENV VARIABLES)
        $apiUrl = rtrim(env('PHILSMS_API_URL'), '/') . '/sms/send';

        foreach ($residents as $user) {
            $response = Http::withToken(env('PHILSMS_API_KEY'))
                ->withoutVerifying()
                ->post($apiUrl, [
                    'recipient' => $user->phone_number,
                    'sender_id' => env('PHILSMS_SENDER_ID'),
                    'type'      => 'plain',
                    'message'   => $message,
                ]);

            if ($response->successful()) {
                $sentCount++;
            } else {
                // Safely capture the exact reason why PhilSMS rejected the request
                $lastError = $response->json() ?? $response->body();
            }
        }

        // 6. Save the broadcast record to the database
        SmsLog::create([
            'user_id' => $currentUser->id,
            'sender_role' => $currentUser->role, 
            'message' => $message,
            'recipients_count' => $sentCount,
            'status' => $sentCount > 0 ? 'success' : 'failed'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Alert broadcasted by " . $currentUser->role . ". Total sent: $sentCount",
            'philsms_debug' => $lastError // Check this in your browser network response tab
        ]);
    }

    // 7. Fetch logs for the React Dashboard table
    public function getLogs()
    {
        $logs = SmsLog::with('user:id,name')->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }
}