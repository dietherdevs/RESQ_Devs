<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\WaterLevelLog;
use Carbon\Carbon;

class WaterLevelLogController extends Controller
{
    public function getLatest()
    {
        try {
            // 1. Fetch Live Data
            $response = Http::withoutVerifying()
                ->timeout(10)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
                ])
                ->get('https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/main_list.do');
            
            if ($response->failed()) {
                return $this->fetchFromLocalDatabase();
            }

            $data = $response->json();
            $targetStation = null;

            // 2. Find "Sto. Nino"
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

            // 3. Process Data
            $level = floatval($targetStation['wl']);
            $pagasaTime = $targetStation['timestr'] ?? now();
            
            // Determine Status
            $status = 'Normal';
            if ($level >= 15) $status = 'Warning';
            if ($level >= 16) $status = 'Critical';
            if ($level >= 18) $status = 'Evacuate';

            // --- 💾 NEW: AUTO-SAVE TO DATABASE 💾 ---
            
            // Convert PAGASA time string to a Database format
            // Example input: "2026-02-07 02:10"
            $recordDate = Carbon::parse($pagasaTime);

            // Check if we already saved this specific reading (to avoid duplicates)
            $exists = WaterLevelLog::where('recorded_at', $recordDate)->exists();

            if (!$exists) {
                WaterLevelLog::create([
                    'location'     => $targetStation['obsnm'],
                    'level_meters' => $level,
                    'status'       => $status,
                    'recorded_at'  => $recordDate
                ]);
            }
            // ----------------------------------------

            return response()->json([
                'location' => $targetStation['obsnm'],
                'level_meters' => $level,
                'status' => $status,
                'recorded_at' => $pagasaTime,
                'source' => 'PAGASA Live API'
            ]);

        } catch (\Exception $e) {
            return $this->fetchFromLocalDatabase();
        }
    }

    private function fetchFromLocalDatabase() {
        $latest = WaterLevelLog::orderBy('recorded_at', 'desc')->first();

        if (!$latest) {
            return response()->json([
                'level_meters' => 0,
                'status' => 'Normal',
                'location' => 'Marikina River (Offline)',
                'recorded_at' => now(),
                'source' => 'System Default'
            ]);
        }
        return response()->json($latest);
    }
}