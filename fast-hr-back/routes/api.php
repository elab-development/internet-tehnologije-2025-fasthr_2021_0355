<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PayrollRecordController;
use App\Http\Controllers\PerformanceReviewController;
use App\Http\Controllers\MetricsController;
use Illuminate\Support\Facades\Route;

// Auth (public).
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Positions (public) - individual routes instead of apiResource.
Route::get('/positions', [PositionController::class, 'index']);          // GET all
Route::get('/positions/{position}', [PositionController::class, 'show']); // GET one
Route::post('/positions', [PositionController::class, 'store']);          // CREATE
Route::put('/positions/{position}', [PositionController::class, 'update']); // UPDATE (full)
Route::patch('/positions/{position}', [PositionController::class, 'update']); // UPDATE (partial)
Route::delete('/positions/{position}', [PositionController::class, 'destroy']); // DELETE

// Protected routes (Sanctum).
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // CRUD.
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('payroll-records', PayrollRecordController::class);
    Route::apiResource('performance-reviews', PerformanceReviewController::class);

    // Stats per model.
    Route::get('/stats/departments', [DepartmentController::class, 'stats']);
    Route::get('/stats/positions', [PositionController::class, 'stats']);
    Route::get('/stats/users', [UserController::class, 'stats']);
    Route::get('/stats/payroll', [PayrollRecordController::class, 'stats']);
    Route::get('/stats/performance-reviews', [PerformanceReviewController::class, 'stats']);

    // App overview metrics.
    Route::get('/metrics/overview', [MetricsController::class, 'overview']);
});