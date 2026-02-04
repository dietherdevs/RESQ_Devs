<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Household;
use Illuminate\Support\Facades\Auth;

class HouseholdController extends Controller
{
    // 1. Get the logged-in user's household info
    public function get()
    {
        $user = Auth::user();
        
        // Find the household linked to this user, or return empty
        $household = Household::where('head_resident_id', $user->id)->first();

        return response()->json($household ?? []);
    }

    // 2. Create or Update the household info
    public function update(Request $request)
    {
        $user = Auth::user();

        // Validate the data
        $validated = $request->validate([
            'street_name'    => 'required|string',
            'house_number'   => 'required|string',
            'total_members'  => 'required|integer|min:1',
            'count_seniors'  => 'nullable|integer',
            'count_pwds'     => 'nullable|integer',
            'contact_number' => 'required|string',
        ]);

        // "updateOrCreate" checks if a record exists for this User ID.
        // If YES -> Update it.
        // If NO -> Create a new one.
        $household = Household::updateOrCreate(
            ['head_resident_id' => $user->id], // Search Condition
            $validated                         // Data to Save
        );

        return response()->json(['message' => 'Household Saved!', 'data' => $household]);
    }
}