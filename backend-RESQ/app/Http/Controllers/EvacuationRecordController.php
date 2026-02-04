<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EvacuationRecord;
use App\Models\EvacuationCenter;

class EvacuationRecordController extends Controller
{
    // 1. GET /api/evacuees
    // List ALL active evacuees (Admitted only)
    public function index()
    {
        // We load the 'resident' info so we can display their names (if linked)
        return EvacuationRecord::with(['resident', 'center'])
            ->where('status', 'Admitted')
            ->orderBy('arrival_time', 'desc')
            ->get();
    }

    // 2. POST /api/evacuees
    // CHECK-IN a family
    public function store(Request $request)
    {
        // Validate the incoming data
        $validated = $request->validate([
            'manual_head_family' => 'required|string',   // We rely on the text name now
            'resident_id'   => 'nullable|integer',       // Optional (can be null)
            'center_id'     => 'required|exists:evacuation_centers,id',
            'member_count'  => 'required|integer|min:1', // Frontend sends this as 'member_count' now (if you updated frontend) OR 'total_members'
            'pwd_count'     => 'nullable|integer',
            'senior_count'  => 'nullable|integer',
            'pregnant_count'=> 'nullable|integer',
            'baby_count'    => 'nullable|integer',
            'phone_number'  => 'required|string',
            'address'       => 'required|string',
        ]);

        // Create the record in the database
        $record = EvacuationRecord::create([
            'manual_head_family' => $validated['manual_head_family'],
            'resident_id'   => null, // Explicitly null for walk-ins
            'center_id'     => $validated['center_id'],
            'member_count'  => $validated['member_count'], 
            'pwd_count'     => $request->pwd_count ?? 0,
            'senior_count'  => $request->senior_count ?? 0,
            'pregnant_count'=> $request->pregnant_count ?? 0,
            'baby_count'    => $request->baby_count ?? 0,
            'phone_number'  => $validated['phone_number'],
            'address'       => $validated['address'],
            'arrival_time'  => now(),
            'status'        => 'Admitted'
        ]);

        return response()->json(['message' => 'Family Checked-In', 'data' => $record], 201);
    }

    // 3. PUT /api/evacuees/{id}/checkout
    // CHECK-OUT a family
    public function checkout($id)
    {
        $record = EvacuationRecord::find($id);

        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $record->update([
            'status' => 'Discharged',
            'departure_time' => now()
        ]);

        return response()->json(['message' => 'Family Checked-Out']);
    }
    
    // 4. GET /api/evacuees/stats
    // Calculates the "Active Evacuees" number for your Dashboard
    public function stats()
    {
        // Sum of all 'member_count' for people who are currently 'Admitted'
        $activeCount = EvacuationRecord::where('status', 'Admitted')->sum('member_count');
        
        return response()->json(['active_count' => (int)$activeCount]);
    }
}