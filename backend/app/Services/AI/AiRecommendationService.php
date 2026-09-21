<?php

namespace App\Services\AI;

class AiRecommendationService
{
    public function __construct(
        private AiAssistantService $assistant
    ) {
    }
}