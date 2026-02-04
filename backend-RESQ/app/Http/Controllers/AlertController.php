<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Alert;

class AlertController extends Controller
{
    // 1. GET /api/alerts (For Residents)
    public function index()
    {
        return Alert::where('status', 'Active')->latest()->get();
    }

    // 2. GET /api/admin/stats (NEW: For Admin Dashboard)
    public function dashboardStats()
    {
        return response()->json([
            'total_sent' => Alert::count(),
            'active_now' => Alert::where('status', 'Active')->count(),
            'latest_alert' => Alert::latest()->first()
        ]);
    }

    // 3. POST /api/alerts (For Sending SMS)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'severity' => 'required|in:Low,Medium,High,Critical',
            'target_street_id' => 'nullable', // Allow null for Broadcast
        ]);

        $alert = Alert::create([
            'title' => $validated['title'],
            'message' => $validated['message'],
            'severity' => $validated['severity'],
            'target_street_id' => $request->target_street_id ?? null, // Explicitly set null if missing
            'status' => 'Active'
        ]);

        return response()->json(['message' => 'Sent!', 'data' => $alert], 201);
    }
}