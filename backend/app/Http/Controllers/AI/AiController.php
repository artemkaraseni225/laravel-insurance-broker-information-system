<?php

namespace App\Http\Controllers\AI;


use App\Services\AI\AiRiskAnalysisService;
use App\Http\Controllers\Controller;
use App\Services\AI\AiAssistantService;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use App\Services\AI\AiDataExtractionService;
use Illuminate\Http\Request;




class AIController extends Controller
{

    public function riskAnalysis(Application $application, AiRiskAnalysisService $aiRiskAnalysisService)
{
    $result = $aiRiskAnalysisService->analyze($application);

    return response()->json([
        'data' => $result,
    ]);
}
    // Контроллер не слишком сложный, поэтому пока валидация и обработка ошибок делается прямо здесь.

    public function parseText(
        Request $request,
        AiDataExtractionService $aiDataExtractionService
    ) {
        $validated = $request->validate([
            'insurance_type' => [
                'required',
                'string',
                'in:auto,property,health',
            ],
            'message' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);

        try {
            $result = $aiDataExtractionService->extractData(
                $validated['insurance_type'],
                $validated['message']
            );

            return response()->json([
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'AI-анализ временно недоступен. Попробуйте позже.',
            ], 503);
        }
}
}