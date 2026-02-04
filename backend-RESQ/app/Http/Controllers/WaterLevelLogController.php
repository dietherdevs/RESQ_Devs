<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WaterLevelLog;

class WaterLevelLogController extends Controller
{
    // GET /api/water-level/latest (For the Dashboard Card)
    public function getLatest()
    {
        // Get the single most recent log
        $latest = WaterLevelLog::orderBy('recorded_at', 'desc')->first();

        if (!$latest) {
            // Return default 0 if no logs exist yet
            return response()->json([
                'level_meters' => 0,
                'status' => 'Normal',
                'location' => 'Marikina River',
                'recorded_at' => now()
            ]);
        }

        return response()->json($latest);
    }

    // POST /api/water-level (To add a new reading)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string',
            'level_meters' => 'required|numeric',
            'status' => 'required|in:Normal,Warning,Critical',
        ]);

        $log = WaterLevelLog::create([
            'location' => $validated['location'],
            'level_meters' => $validated['level_meters'],
            'status' => $validated['status'],
            'recorded_at' => now()
        ]);

        return response()->json(['message' => 'Logged', 'data' => $log], 201);
    }
}