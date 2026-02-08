<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\WaterLevelLog;
use Carbon\Carbon;

class WaterLevelLogController extends Controller
{
    public function getLatest()
    {
        try {
            // Fetch from PAGASA
            $response = Http::withoutVerifying()
                ->timeout(10)
                ->get('https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/main_list.do');
            
            if ($response->failed()) {
                return $this->fetchFromLocalDatabase();
            }

            $data = $response->json();
            $targetStation = null;

            foreach ($data as $station) {
                if (isset($station['obsnm'])) {
                    if (stripos($station['obsnm'], 'Nino') !== false || stripos($station['obsnm'], 'Marikina') !== false) {
                        $targetStation = $station;
                        break;
                    }
                }
            }

            if (!$targetStation) {
                return $this->fetchFromLocalDatabase();
            }

            $level = floatval($targetStation['wl']);
            $pagasaTime = $targetStation['timestr'] ?? now();
            $status = $this->determineStatus($level);
            $recordDate = Carbon::parse($pagasaTime);

            // Check if exists
            $exists = WaterLevelLog::where('recorded_at', $recordDate)->exists();

            if (!$exists) {
                $this->processNewWaterLevel($level, $status, $targetStation['obsnm'], $recordDate);
            }

            return response()->json([
                'location' => $targetStation['obsnm'],
                'level_meters' => $level,
                'status' => $status,
                'recorded_at' => $pagasaTime,
                'source' => 'PAGASA Live API'
            ]);

        } catch (\Exception $e) {
            Log::error("Water Level Error: " . $e->getMessage());
            return $this->fetchFromLocalDatabase();
        }
    }

    public function store(Request $request)
    {
        $request->validate(['level' => 'required|numeric']);
        $level = $request->level;
        $status = $this->determineStatus($level);
        
        $log = $this->processNewWaterLevel($level, $status, 'Sensor Device', now());

        return response()->json([
            'message' => 'Water level updated successfully',
            'data' => $log,
            'status' => $status
        ]);
    }

    private function processNewWaterLevel($level, $status, $location, $date)
    {
        // ✅ FIXED: Using orderBy('recorded_at') instead of latest()
        $lastLog = WaterLevelLog::orderBy('recorded_at', 'desc')->first();
        $previousStatus = $lastLog ? $lastLog->status : 'Normal';

        $log = WaterLevelLog::create([
            'location'     => $location,
            'level_meters' => $level,
            'status'       => $status,
            'recorded_at'  => $date
        ]);

        if ($status !== $previousStatus) {
            $smsMessage = $this->getSmsMessage($status, $level);
            $this->broadcastSms($smsMessage);
        }

        return $log;
    }

    private function fetchFromLocalDatabase() {
        // ✅ FIXED: Using orderBy('recorded_at') here too
        $latest = WaterLevelLog::orderBy('recorded_at', 'desc')->first();

        if (!$latest) {
            return response()->json([
                'level_meters' => 0,
                'status' => 'Normal',
                'recorded_at' => now(),
                'source' => 'System Default'
            ]);
        }
        return response()->json($latest);
    }

    private function determineStatus($level) {
        if ($level >= 16) return 'Critical';
        if ($level >= 15) return 'Warning';
        return 'Normal';
    }

    private function getSmsMessage($status, $level) {
        return "RESQ ALERT: Status is now $status. Water Level: $level meters.";
    }

    private function broadcastSms($message)
    {
        // ⚠️ HARDCODED NUMBER
        $recipient = '09631630548'; 
        $token = env('PHILSMS_API_TOKEN');

        try {
            // ✅ FIXED: added withoutVerifying() to fix SSL Error
            Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post('https://dashboard.philsms.com/api/v3/sms/send', [
                'recipient' => $recipient,
                'sender_id' => env('PHILSMS_SENDER_ID', 'PhilSMS'),
                'type' => 'plain',
                'message' => $message,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send auto-SMS: " . $e->getMessage());
        }
    }
}