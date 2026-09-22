<?php

use App\Http\Controllers\AI\AiTestController;
use App\Http\Controllers\Api\Admin\InsuranceTypeController as AdminInsuranceTypeController;
use App\Http\Controllers\Api\Admin\TariffController as AdminTariffController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\StatisticsController;
use App\Http\Controllers\Api\BrokerApplicationController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalculatorController;
use App\Http\Controllers\Api\InsuranceTypeController;
use App\Http\Controllers\Api\PolicyController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/calculator/quote', [CalculatorController::class, 'quote']);
Route::get('/insurance-types', [InsuranceTypeController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);

    Route::post('/applications', [ApplicationController::class, 'store'])->middleware('throttle:5,1');
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{application}', [ApplicationController::class, 'show']);
    Route::post('/applications/{application}/pay', [ApplicationController::class, 'pay']);

    Route::post(
    '/applications/{application}/documents',
    [DocumentController::class, 'store']
    );

    Route::get('/documents/{document}', [DocumentController::class, 'show']);
    Route::get('/policies', [PolicyController::class, 'index']);
    Route::get('/policies/{policy}', [PolicyController::class, 'show']);
    Route::get('/policies/{policy}/pdf', [PolicyController::class, 'pdf']);
    Route::get('/policies/{policy}/payment-receipt', [PolicyController::class, 'paymentReceipt']);

    Route::middleware('role:broker')->group(function () {

        Route::get('/broker/applications', [BrokerApplicationController::class, 'index']);
        Route::get('/broker/my-applications', [BrokerApplicationController::class, 'mine']);
        Route::post('/broker/applications/{application}/claim', [BrokerApplicationController::class, 'claim']);
        Route::patch('/broker/applications/{application}/status', [BrokerApplicationController::class, 'updateStatus']);

    });

     Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/statistics', [StatisticsController::class, 'index']);
          Route::post('/users', [AdminUserController::class, 'store']);
        Route::apiResource('insurance-types', AdminInsuranceTypeController::class)->except(['show']);

        Route::apiResource('tariffs', AdminTariffController::class)->except(['show']);
        Route::get('/insurance-companies', [AdminTariffController::class, 'companies']);

        Route::patch('/users/{user}/status', [AdminUserController::class, 'updateStatus']);
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);

        Route::get('/ping', function () {
            return response()->json(['message' => 'ok, ты администратор']);
        });
    });
});


Route::middleware('auth:sanctum')->get(
    '/applications/{application}/risk-analysis',
    [AiTestController::class, 'riskAnalysis']
);
