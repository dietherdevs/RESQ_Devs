<?php

namespace App\Http\Controllers;

use App\Models\FloodLevel;
use App\Models\User;
use App\Models\SmsLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FloodMonitoringController extends Controller
{
    private function determineStatus($level) {
        if ($level >= 18) return 'CRITICAL';
        if ($level >= 17) return 'ALERT LEVEL 3';
        if ($level >= 16) return 'ALERT LEVEL 2';
        if ($level >= 15) return 'ALERT LEVEL 1';
        return 'NORMAL';
    }

    public function getLatestReadings()
    {
        // 1. Get the most recent record from the DB
        $latest = FloodLevel::orderBy('fetched_at', 'desc')->first();

        // 2. CACHE-GATE: If data is missing OR (older than 10 mins AND not manual), trigger a sync
        if (!$latest || ($latest->status !== 'manual' && $latest->fetched_at->diffInMinutes(now()) >= 10)) {
            Artisan::call('flood:sync');
        }

        // 3. Return the latest 24 records for your UI chart
        $readings = FloodLevel::orderBy('fetched_at', 'desc')
            ->take(24)
            ->get()
            ->reverse() 
            ->values(); 

        return response()->json($readings);
    }

    public function storeOverride(Request $request)
    {
        $request->validate(['level' => 'required|numeric|min:0|max:30']);
        $newLevel = $request->level;
        $newStatusText = $this->determineStatus($newLevel);
        
        // 1. Get the last known status to check if it changed
        $lastRecord = FloodLevel::orderBy('fetched_at', 'desc')->first();
        $oldStatusText = $lastRecord ? $this->determineStatus($lastRecord->water_level) : 'NORMAL';

        // 2. Save the manual override
        $flood = new FloodLevel();
        $flood->obscd = 'MANUAL_OVERRIDE';
        $flood->water_level = $newLevel;
        $flood->status = 'manual';
        $flood->fetched_at = Carbon::now('Asia/Manila');
        $flood->save();

        // 3. AUTO-SMS TRIGGER LOGIC WITH DIAGNOSTICS
        $smsDebug = "Ignored: Status did not change or changed to NORMAL. (Old: $oldStatusText, New: $newStatusText)";

        // Fire SMS if status changed and is not NORMAL
        if ($newStatusText !== $oldStatusText && $newStatusText !== 'NORMAL') {
            $smsDebug = $this->triggerAutomatedSms($newStatusText, $newLevel);
        }

        return response()->json([
            'status' => 'success', 
            'data' => $flood,
            'sms_debug' => $smsDebug // <-- Look for this in your browser's Network tab!
        ]);
    }

    /**
     * NEW: Resets the system back to the real API data.
     * Deletes the fake test data so the chart goes back to normal, 
     * and silently syncs without sending an SMS.
     */
    public function resetOverride()
    {
        // 1. Wipe all manual override test data from the database
        FloodLevel::where('status', 'manual')->delete();

        // 2. Force a fresh scrape from PAGASA right now to get the true live level
        Artisan::call('flood:sync');

        return response()->json([
            'status' => 'success',
            'message' => 'System reset to live sensor data'
        ]);
    }

    private function triggerAutomatedSms($statusText, $level)
    {
        // Fetch ALL approved users who have a phone number registered
        $recipients = User::where('is_approved', true)
                          ->whereNotNull('phone_number')
                          ->get();

        if ($recipients->isEmpty()) {
            return "Triggered, but aborted: No approved users with phone numbers found.";
        }

        $message = "RESQ AUTOMATED ALERT: Marikina River is now at {$statusText}. Water Level: {$level}m. Please prepare for possible evacuation.";
        $sentCount = 0;
        $lastError = null;
        
        // Format the PhilSMS URL exactly like your Broadcast controller
        $apiUrl = rtrim(env('PHILSMS_API_URL'), '/') . '/sms/send';

        foreach ($recipients as $user) {
            try {
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
                    $lastError = $response->json() ?? $response->body();
                }
            } catch (\Exception $e) {
                Log::error("Auto-SMS Failed for {$user->phone_number}: " . $e->getMessage());
                $lastError = $e->getMessage();
            }
        }

        // Log it so it shows up in your Broadcast History table
        if ($sentCount > 0) {
            SmsLog::create([
                'user_id' => auth()->id() ?? null,
                'sender_role' => 'SYSTEM_AUTO', 
                'message' => $message,
                'recipients_count' => $sentCount,
                'status' => 'success'
            ]);
        }

        return [
            'message' => "Attempted to send to {$recipients->count()} approved users. Success: $sentCount",
            'philsms_error' => $lastError
        ];
    }
}