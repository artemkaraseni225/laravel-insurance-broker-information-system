<?php

namespace App\Http\Controllers\AI;


use App\Services\AI\AiRiskAnalysisService;
use App\Http\Controllers\Controller;
use App\Services\AI\AiAssistantService;
use App\Models\Application;
use Illuminate\Http\JsonResponse;



class AiTestController extends Controller
{

    public function riskAnalysis(Application $application, AiRiskAnalysisService $aiRiskAnalysisService)
{
    $result = $aiRiskAnalysisService->analyze($application);

    return response()->json([
        'data' => $result,
    ]);
}
}