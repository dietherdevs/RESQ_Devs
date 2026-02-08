<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Alert;
use App\Models\User; 
use Illuminate\Support\Facades\Http; 
use Illuminate\Support\Facades\Log;

class AlertController extends Controller
{
    // ... index and dashboardStats functions ...
    public function index()
    {
        return Alert::where('status', 'Active')->latest()->get();
    }

    public function dashboardStats()
    {
        return response()->json([
            'total_sent' => Alert::count(),
            'active_now' => Alert::where('status', 'Active')->count(),
            'latest_alert' => Alert::latest()->first()
        ]);
    }

    // --- FUNCTION 1: Manual SMS Broadcast ---
    public function sendManualSms(Request $request)
    {
        $request->validate(['message' => 'required|string']);

        // 1. STRICT QUERY: Only Valid Numbers + SMS Enabled
        $users = User::whereNotNull('phone_number')
                     ->where('phone_number', '!=', '')
                     ->where('sms_enabled', true) // <--- STRICT FILTER
                     ->take(10) 
                     ->get();

        $sentCount = 0;

        foreach ($users as $user) {
            $phone = $this->formatPhoneNumber($user->phone_number);
            
            if ($phone) {
                // Send and track success
                $success = $this->triggerPhilSms($phone, $request->message);
                if ($success) {
                    $sentCount++;
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Broadcast sent successfully to $sentCount Globe/TM subscribers!",
        ]);
    }

    // --- FUNCTION 2: Dashboard Alert Route ---
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'severity' => 'required|string'
        ]);

        $alert = Alert::create([
            'title' => $request->title,
            'severity' => $request->severity,
            'message' => $request->message,
            'status' => 'Active'
        ]);

        $users = User::whereNotNull('phone_number')
                     ->where('phone_number', '!=', '')
                     ->where('sms_enabled', true)
                     ->take(10)
                     ->get();

        foreach ($users as $user) {
            $phone = $this->formatPhoneNumber($user->phone_number);
            if ($phone) {
                $this->triggerPhilSms($phone, $request->message);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Alert posted & SMS sent to Globe subscribers.',
            'data' => $alert
        ]);
    }

    // --- HELPER: Number Formatter ---
    private function formatPhoneNumber($number)
    {
        $number = preg_replace('/[^0-9]/', '', $number);

        // Convert 09xx -> 639xx
        if (substr($number, 0, 2) == '09') {
            return '63' . substr($number, 1);
        }
        
        // If already 639xx, keep it
        if (substr($number, 0, 2) == '63') {
            return $number;
        }

        return null; 
    }

    // --- HELPER: Sending Logic (Globe/TM Version) ---
    private function triggerPhilSms($recipient, $message)
    {
        // 🛑 YOUR TOKEN IS HERE 🛑
        $token = '1293|gg0FXhGrDbvjC8e8z7c4GjLrGqDTu0AYU2wKzKRrb55c6e42'; 
        
        try {
            Log::info("Attempting to send SMS to: " . $recipient);

            $response = Http::withoutVerifying()
                ->timeout(10) 
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])->post('https://dashboard.philsms.com/api/v3/sms/send', [
                    'recipient' => $recipient,
                    
                    // ✅ MUST BE 'PhilSMS' for Globe/TM to work
                    'sender_id' => 'PhilSMS', 
                    
                    'type' => 'plain',
                    'message' => $message,
                ]);

            Log::info("PhilSMS Response: " . $response->body());

            if ($response->successful()) {
                return true; 
            } else {
                return false;
            }

        } catch (\Exception $e) {
            Log::error("SMS System Error: " . $e->getMessage());
            return false;
        }
    }
}