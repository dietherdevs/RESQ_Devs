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
// 1. PUBLIC ROUTES
// ===========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/alerts', [AlertController::class, 'index']); 
Route::get('/water-level/latest', [WaterLevelLogController::class, 'getLatest']); 
Route::get('/evacuation-centers/active', [EvacuationCenterController::class, 'getActiveCenters']); 
Route::get('/centers', [EvacuationCenterController::class, 'index']); 
Route::get('/hello', function () { return response()->json(['message' => 'Connected successfully!']); });

// ===========================================
// 2. PROTECTED ROUTES
// ===========================================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) { return $request->user(); });
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile/household', [HouseholdController::class, 'get']);
    Route::post('/profile/household', [HouseholdController::class, 'update']);
    Route::post('/profile/image', [ProfileImageController::class, 'update']);

    // --- RBAC: LEVEL 1 (Staff/Admin/Superadmin) ---
    Route::middleware('role:staff,admin,superadmin')->group(function () {
        Route::post('/alerts', [AlertController::class, 'store']);
        Route::post('/water-level', [WaterLevelLogController::class, 'store']);
        Route::put('/centers/{id}', [EvacuationCenterController::class, 'update']); 
        Route::get('/evacuees', [EvacuationRecordController::class, 'index']);
        Route::post('/evacuees', [EvacuationRecordController::class, 'store']);
        Route::put('/evacuees/{id}/checkout', [EvacuationRecordController::class, 'checkout']);
        Route::get('/evacuees/stats', [EvacuationRecordController::class, 'stats']);
        Route::get('/admin/stats', [AlertController::class, 'dashboardStats']);
    });

    // --- RBAC: LEVEL 2 (Admin/Superadmin) ---
    Route::middleware('role:admin,superadmin')->group(function () {
        Route::post('/centers', [EvacuationCenterController::class, 'store']);
        
        // This is likely for Residents (AdminUserController handles admins, but if you re-use it:)
        Route::get('/admin/users', [AdminUserController::class, 'index']); 
        Route::post('/admin/users/{id}/toggle', [AdminUserController::class, 'toggleStatus']);
        Route::post('/admin/users/{id}/reset', [AdminUserController::class, 'resetPassword']);
    });

    // --- RBAC: LEVEL 3 (Superadmin Only) ---
    Route::middleware('role:superadmin')->group(function () {
        
        // List Admins
        Route::get('/admin/list', [AdminUserController::class, 'index']); 
        
        // Create Admin
        Route::post('/admin/create', [AuthController::class, 'createAdmin']);

        // ✅ UPDATE ADMIN (This route was missing!)
        Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    });

});