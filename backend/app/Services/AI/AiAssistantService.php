<?php

// Занимется отправкой HTTP запросов к API Groq и обработкой ответов.

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;

class AiAssistantService
{
    public function ask(string $prompt): string
    {
        $response = Http::withToken(config('services.groq.api_key'))
            ->post(config('services.groq.url') . '/chat/completions', [
                'model' => config('services.groq.model'),

                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],

                'temperature' => 0.2,
            ]);

        $response->throw();

        return $response->json('choices.0.message.content');
    }
}