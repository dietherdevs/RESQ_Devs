<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- CONTROLLER IMPORTS ---
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\EvacuationCenterController;
use App\Http\Controllers\WaterLevelLogController;
use App\Http\Controllers\EvacuationRecordController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\ProfileImageController;
use App\Http\Controllers\AdminUserController; 

// ===========================================
// 1. PUBLIC ROUTES (Accessible by everyone)
// ===========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public Data Feeds
Route::get('/alerts', [AlertController::class, 'index']); 
Route::get('/water-level/latest', [WaterLevelLogController::class, 'getLatest']); 
Route::get('/evacuation-centers/active', [EvacuationCenterController::class, 'getActiveCenters']); 
Route::get('/centers', [EvacuationCenterController::class, 'index']); 

// Connection Test
Route::get('/hello', function () { return response()->json(['message' => 'Connected successfully!']); });

// ===========================================
// 2. PROTECTED ROUTES (Requires Login)
// ===========================================
Route::middleware('auth:sanctum')->group(function () {

    // User Info
    Route::get('/user', function (Request $request) { return $request->user(); });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile Management
    Route::get('/profile/household', [HouseholdController::class, 'get']);
    Route::post('/profile/household', [HouseholdController::class, 'update']);
    Route::post('/profile/image', [ProfileImageController::class, 'update']);

    // ✅ NEW: Toggle SMS Settings (For Profile Page)
    Route::post('/profile/toggle-sms', function (Request $request) {
        $user = $request->user();
        $request->validate(['sms_enabled' => 'required|boolean']);
        
        $user->sms_enabled = $request->sms_enabled;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'SMS settings updated!',
            'sms_enabled' => $user->sms_enabled
        ]);
    });

    // --- RBAC: LEVEL 1 (Staff / Admin / Superadmin) ---
    // These users can Manage Evacuees, Send Alerts, and Input Water Levels
    Route::middleware('role:staff,admin,superadmin')->group(function () {
        
        // 🚀 UPDATED: SMS Sending Route (Matches AlertController method)
        Route::post('/sms/send', [AlertController::class, 'sendManualSms']);

        // Alerts & Water Level
        Route::post('/alerts', [AlertController::class, 'store']);
        Route::post('/water-level', [WaterLevelLogController::class, 'store']); // Manual/Sensor Input
        
        // Evacuation Center Management
        Route::put('/centers/{id}', [EvacuationCenterController::class, 'update']); 
        
        // Evacuee Management
        Route::get('/evacuees', [EvacuationRecordController::class, 'index']);
        Route::post('/evacuees', [EvacuationRecordController::class, 'store']);
        Route::put('/evacuees/{id}/checkout', [EvacuationRecordController::class, 'checkout']);
        Route::get('/evacuees/stats', [EvacuationRecordController::class, 'stats']);
        
        // Dashboard Stats
        Route::get('/admin/stats', [AlertController::class, 'dashboardStats']);
    });

    // --- RBAC: LEVEL 2 (Admin / Superadmin) ---
    // These users can Manage Centers and Regular Users
    Route::middleware('role:admin,superadmin')->group(function () {
        Route::post('/centers', [EvacuationCenterController::class, 'store']);
        
        // Manage Residents
        Route::get('/admin/users', [AdminUserController::class, 'index']); 
        Route::post('/admin/users/{id}/toggle', [AdminUserController::class, 'toggleStatus']);
        Route::post('/admin/users/{id}/reset', [AdminUserController::class, 'resetPassword']);
    });

    // --- RBAC: LEVEL 3 (Superadmin Only) ---
    // Only Superadmin can create/edit other Admins
    Route::middleware('role:superadmin')->group(function () {
        
        // List Admins
        Route::get('/admin/list', [AdminUserController::class, 'index']); 
        
        // Create Admin
        Route::post('/admin/create', [AuthController::class, 'createAdmin']);

        // Update Admin
        Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    });

});