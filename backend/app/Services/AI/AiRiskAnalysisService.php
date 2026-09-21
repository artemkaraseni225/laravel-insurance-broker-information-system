<?php

namespace App\Services\AI;

class AiRiskAnalysisService
{
    public function __construct(
        private AiAssistantService $assistant
    ) {
    }
}