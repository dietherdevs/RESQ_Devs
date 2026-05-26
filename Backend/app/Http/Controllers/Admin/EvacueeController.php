<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Evacuee;
use Illuminate\Http\Request;

class EvacueeController extends Controller
{
    public function index() {
        return response()->json(['data' => Evacuee::where('status', 'evacuated')->get()]);
    }

    public function store(Request $request) {
        $data = $request->all();
        
        // Quick Fix: Copy the address into the barangay column so Postgres doesn't crash
        $data['barangay'] = $request->address ?? 'N/A';
        
        $evacuee = Evacuee::create($data);
        return response()->json($evacuee, 201);
    }

    public function update(Request $request, $id) {
        $evacuee = Evacuee::findOrFail($id);
        
        $data = $request->all();
        $data['barangay'] = $request->address ?? 'N/A';

        $evacuee->update($data);
        return response()->json($evacuee);
    }

    public function destroy($id) {
        // Safely delete only the evacuee!
        Evacuee::destroy($id); 
        return response()->json(['message' => 'Deleted successfully']);
    }
}