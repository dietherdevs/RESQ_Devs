<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EvacuationCenter;
use Illuminate\Http\Request;

class EvacuationCenterController extends Controller
{
    public function index() {
        return response()->json(['data' => EvacuationCenter::all()]);
    }

    public function store(Request $request) {
        $center = EvacuationCenter::create($request->all());
        return response()->json($center, 201);
    }

    public function update(Request $request, $id) {
        $center = EvacuationCenter::findOrFail($id);
        $center->update($request->all());
        return response()->json($center);
    }

    public function destroy($id) {
        EvacuationCenter::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}