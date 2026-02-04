<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlertController;
use Illuminate\Support\Facades\File;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/



Route::any('/{any}', function () {
    return File::get(public_path('index.html'));
})->where('any', '.*');
// 1. Get all active alerts
Route::get('/alerts', [AlertController::class, 'index']);

// 2. Create a new alert (We will protect this with login later)
Route::post('/alerts', [AlertController::class, 'store']);