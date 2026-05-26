<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SmsLog;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats()
    {
        try {
            // 1. Top Stats
            $smsSentToday = DB::table('sms_logs')
                ->whereDate('created_at', Carbon::today())
                ->sum('recipients_count');

            $latestWaterLevel = DB::table('flood_levels')
                ->latest('created_at')
                ->value('water_level') ?? 0;

            $totalCenters = DB::table('evacuation_centers')->count();
            
            $openCenters = DB::table('evacuation_centers')
                ->where('status', 'open') 
                ->count();

            $totalEvacuees = DB::table('evacuees')
                ->where('status', 'evacuated')
                ->sum('total') ?? 0;

            // 2. Evacuation Centers List (For the bottom grid)
            $centersList = DB::table('evacuation_centers')
                ->select('id', 'name', 'capacity', 'current', 'status')
                ->orderBy('name', 'asc')
                ->get();

            // 3. Flood History (For the Chart)
            $floodHistory = DB::table('flood_levels')
                ->select('water_level as level', 'created_at')
                ->orderBy('created_at', 'desc')
                ->take(24)
                ->get()
                ->reverse()
                ->map(function($item) {
                    return [
                        'time' => Carbon::parse($item->created_at)->format('g:i A'),
                        'level' => (float) $item->level
                    ];
                })->values();

            // 4. Recent Activity Timeline (Merging SMS, Evacuees, and Flood updates)
            $recentSms = DB::table('sms_logs')->orderBy('created_at', 'desc')->take(3)->get()->map(function($log) {
                return [
                    'id' => 'sms_' . $log->id,
                    'type' => 'info',
                    'msg' => "Broadcasted SMS alert to {$log->recipients_count} recipients",
                    'time' => Carbon::parse($log->created_at)->format('g:i A'),
                    'timestamp' => $log->created_at
                ];
            });

            $recentEvac = DB::table('evacuees')->orderBy('created_at', 'desc')->take(3)->get()->map(function($evac) {
                return [
                    'id' => 'evac_' . $evac->id,
                    'type' => 'warning',
                    'msg' => "Registered new evacuee family: {$evac->head} ({$evac->total} members)",
                    'time' => Carbon::parse($evac->created_at)->format('g:i A'),
                    'timestamp' => $evac->created_at
                ];
            });

            $recentFlood = DB::table('flood_levels')->orderBy('created_at', 'desc')->take(3)->get()->map(function($flood) {
                $type = $flood->water_level >= 16 ? 'danger' : ($flood->water_level >= 15 ? 'warning' : 'info');
                return [
                    'id' => 'flood_' . $flood->id,
                    'type' => $type,
                    'msg' => "Water level updated to {$flood->water_level}m",
                    'time' => Carbon::parse($flood->created_at)->format('g:i A'),
                    'timestamp' => $flood->created_at
                ];
            });

            // Combine them, sort by newest first, take the top 5
            $activities = collect($recentSms)
                ->merge($recentEvac)
                ->merge($recentFlood)
                ->sortByDesc('timestamp')
                ->take(5)
                ->values()
                ->map(function($item) {
                    unset($item['timestamp']); // Remove the raw timestamp before sending to frontend
                    return $item;
                });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'water_level' => (float) $latestWaterLevel,
                    'open_centers' => $openCenters,
                    'total_centers' => $totalCenters,
                    'total_evacuees' => (int) $totalEvacuees,
                    'sms_sent_today' => (int) $smsSentToday,
                    'evacuation_centers' => $centersList,
                    'flood_history' => $floodHistory,
                    'recent_activity' => $activities
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch dashboard stats: ' . $e->getMessage()
            ], 500);
        }
    }
}