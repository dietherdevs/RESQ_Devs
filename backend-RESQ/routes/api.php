<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// 1. IMPORT THE CONTROLLER (This was missing!)
use App\Http\Controllers\AlertController;
use App\Http\Controllers\EvacuationCenterController;
use App\Http\Controllers\WaterLevelLogController;
use App\Http\Controllers\EvacuationRecordController;
use App\Http\Controllers\AuthController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Keep your connection test (optional, but good for checking)
Route::get('/hello', function () {
    return response()->json([
        'message' => 'Connected successfully to the RESQ Backend!'
    ]);
});

// --- ALERT SYSTEM ROUTES ---

// 2. Get all active alerts (Public)
Route::get('/alerts', [AlertController::class, 'index']);

Route::get('/admin/stats', [AlertController::class, 'dashboardStats']);

Route::post('/alerts', [AlertController::class, 'store']);

Route::get('/centers', [EvacuationCenterController::class, 'index']);
Route::post('/centers', [EvacuationCenterController::class, 'store']);
Route::put('/centers/{id}', [EvacuationCenterController::class, 'update']);

Route::get('/water-level/latest', [WaterLevelLogController::class, 'getLatest']);
Route::post('/water-level', [WaterLevelLogController::class, 'store']);

// EVACUEE MANAGEMENT
Route::get('/evacuees', [EvacuationRecordController::class, 'index']); // List
Route::post('/evacuees', [EvacuationRecordController::class, 'store']); // Check-in
Route::put('/evacuees/{id}/checkout', [EvacuationRecordController::class, 'checkout']); // Check-out
Route::get('/evacuees/stats', [EvacuationRecordController::class, 'stats']); // Dashboard number

Route::middleware('auth:sanctum')->group(function () {
    
Route::get('/admin/users', [App\Http\Controllers\AdminUserController::class, 'index']);
    Route::post('/admin/users/{id}/toggle', [App\Http\Controllers\AdminUserController::class, 'toggleStatus']);
    Route::post('/admin/users/{id}/reset', [App\Http\Controllers\AdminUserController::class, 'resetPassword']);

    // HOUSEHOLD / PROFILE ROUTES
    Route::get('/profile/household', [App\Http\Controllers\HouseholdController::class, 'get']);
    Route::post('/profile/household', [App\Http\Controllers\HouseholdController::class, 'update']);
    Route::post('/profile/image', [App\Http\Controllers\ProfileImageController::class, 'update']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);