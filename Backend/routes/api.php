<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\FloodMonitoringController;
use App\Http\Controllers\Admin\SmsBroadcastController; 
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EvacuationCenterController; 
use App\Http\Controllers\Admin\EvacueeController; 
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\Admin\ManageAdminController; // <--- NEW IMPORT

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Public Routes (No token required) ───────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password Reset Routes
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

/**
 * Flood Monitoring Data
 * Accessible to everyone so residents can check levels instantly.
 */
Route::get('/flood/history', [FloodMonitoringController::class, 'getLatestReadings']);

/**
 * Public Evacuation Centers Data
 * Allows the public dashboard to read the live status without an admin token.
 */
Route::get('/evacuation-centers', [EvacuationCenterController::class, 'index']);

// ── Protected Routes (Token required) ────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Get the currently logged-in user's profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Update Profile & SMS Settings
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);

    // Admin & Staff Management
    Route::prefix('admin')->group(function () {
        
        // Dashboard Data
        Route::get('/dashboard-stats', [DashboardController::class, 'getStats']);

        // Evacuation Management (CRUD Routes)
        Route::apiResource('evacuation-centers', EvacuationCenterController::class);
        Route::apiResource('evacuees', EvacueeController::class);

        // User Verification & History
        Route::get('/users/all', [UserController::class, 'getAllUsers']);
        Route::post('/users/{id}/approve', [UserController::class, 'approveUser']);
        Route::delete('/users/{id}/reject', [UserController::class, 'rejectUser']);

        /**
         * Admin Account Management (SuperAdmin only logically)
         * NEW ROUTES ADDED HERE
         */
        Route::get('/manage-admins', [ManageAdminController::class, 'index']);
        Route::post('/manage-admins', [ManageAdminController::class, 'store']);
        Route::put('/manage-admins/{id}', [ManageAdminController::class, 'update']);
        Route::patch('/manage-admins/{id}/toggle-status', [ManageAdminController::class, 'toggleStatus']);
        Route::delete('/manage-admins/{id}', [ManageAdminController::class, 'destroy']);

        /**
         * Manual SMS Broadcast & History
         */
        Route::get('/sms-recipients', [SmsBroadcastController::class, 'getRecipientStats']); 
        Route::post('/broadcast-sms', [SmsBroadcastController::class, 'broadcast']); 
        Route::get('/sms-logs', [SmsBroadcastController::class, 'getLogs']); 

        /**
         * Flood Monitoring Manual Override & Reset
         */
        Route::post('/flood/manual-override', [FloodMonitoringController::class, 'storeOverride']);
        Route::post('/flood/reset-override', [FloodMonitoringController::class, 'resetOverride']);
    });
});