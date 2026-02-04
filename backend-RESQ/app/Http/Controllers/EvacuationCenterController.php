<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EvacuationCenter;

class EvacuationCenterController extends Controller
{
    // GET /api/centers
    public function index()
    {
        return EvacuationCenter::all();
    }

    // POST /api/centers (Add new center)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'location' => 'required|string',
            'capacity' => 'required|integer',
            'contact_number' => 'nullable|string',
            'status' => 'required|in:Open,Closed,Full',
        ]);

        $center = EvacuationCenter::create($validated);

        return response()->json(['message' => 'Center added', 'data' => $center], 201);
    }

    // PUT /api/centers/{id} (Update status like "Closed" -> "Open")
    public function update(Request $request, $id)
    {
        $center = EvacuationCenter::find($id);

        if (!$center) {
            return response()->json(['message' => 'Center not found'], 404);
        }

        $center->update($request->validate([
            'status' => 'in:Open,Closed,Full',
            'capacity' => 'integer',
            'contact_number' => 'string'
        ]));

        return response()->json(['message' => 'Status updated', 'data' => $center]);
    }
}