<?php

namespace App\Services\AI;
use App\Services\AI\AiAssistantService;

class AiRiskAnalysisService
{
    public function __construct(
        private AiAssistantService $assistant
    ) {
    }
}