<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservationController;
use Illuminate\Support\Facades\Route;

// 認証不要
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/availability', [AvailabilityController::class, 'index']);

// カレンダー表示用（公開）
Route::get('/holidays', [Admin\HolidayController::class, 'index']);
Route::get('/weekly-holidays', [Admin\WeeklyHolidayController::class, 'index']);
Route::get('/pricing', [Admin\PricingController::class, 'show']);

// 認証必須
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // 予約
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::patch('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);

    // 管理者専用
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/reservations', [Admin\ReservationController::class, 'index']);
        Route::post('/reservations', [Admin\ReservationController::class, 'store']);
        Route::patch('/reservations/{reservation}/cancel', [Admin\ReservationController::class, 'cancel']);

        Route::get('/users', [Admin\UserController::class, 'index']);

        Route::get('/pricing', [Admin\PricingController::class, 'show']);
        Route::put('/pricing', [Admin\PricingController::class, 'update']);

        Route::get('/holidays', [Admin\HolidayController::class, 'index']);
        Route::post('/holidays', [Admin\HolidayController::class, 'store']);
        Route::delete('/holidays/{holiday}', [Admin\HolidayController::class, 'destroy']);

        Route::get('/weekly-holidays', [Admin\WeeklyHolidayController::class, 'index']);
        Route::post('/weekly-holidays', [Admin\WeeklyHolidayController::class, 'store']);
        Route::delete('/weekly-holidays/{weeklyHoliday}', [Admin\WeeklyHolidayController::class, 'destroy']);

        Route::get('/analytics', [Admin\AnalyticsController::class, 'index']);
    });
});
