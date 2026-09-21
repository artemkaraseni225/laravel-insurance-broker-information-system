<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Services\AI\AiAssistantService;
use Illuminate\Http\JsonResponse;

class AiTestController extends Controller
{
    public function test(AiAssistantService $assistant): JsonResponse
    {
        $response = $assistant->ask(
            'Explain in one short sentence what an insurance broker does.'
        );

        return response()->json([
            'success' => true,
            'response' => $response,
        ]);
    }
}