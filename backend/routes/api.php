<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SchoolController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-school', [SchoolController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // Books
    Route::post('/books/scan', [App\Http\Controllers\BookController::class, 'scan']);
    Route::get('/books/search/{isbn}', [App\Http\Controllers\BookController::class, 'searchByIsbn']);
    Route::apiResource('books', App\Http\Controllers\BookController::class);

    // Students
    Route::apiResource('students', App\Http\Controllers\StudentController::class);

    // Loans
    Route::post('/loans/{loan}/return', [App\Http\Controllers\LoanController::class, 'returnBook']);
    Route::apiResource('loans', App\Http\Controllers\LoanController::class);

    // Team (Users / Librarians)
    Route::apiResource('users', App\Http\Controllers\UserController::class);

    // Settings (School Config)
    Route::get('/settings/school', [App\Http\Controllers\SchoolController::class, 'showConfig']);
    Route::put('/settings/school', [App\Http\Controllers\SchoolController::class, 'updateConfig']);

    // Dashboard
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index']);
});
