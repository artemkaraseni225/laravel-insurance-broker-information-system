<?php

namespace App\Services\AI;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiAssistantService
{
    public function ask(string $prompt): string
    {
        try {
            $response = Http::withToken(
                config('services.groq.api_key')
            )
                ->timeout(30)
                ->connectTimeout(10)
                ->post(
                    config('services.groq.url') . '/chat/completions',
                    [
                        'model' => config('services.groq.model'),

                        'messages' => [
                            [
                                'role' => 'user',
                                'content' => $prompt,
                            ],
                        ],

                        'temperature' => 0.2,

                        'response_format' => [
                            'type' => 'json_object',
                        ],
                    ]
                );

            $response->throw();

            $content = $response->json(
                'choices.0.message.content'
            );

            if (!is_string($content) || trim($content) === '') {
                throw new RuntimeException(
                    'Groq API returned an empty response.'
                );
            }

            return $content;
        } catch (ConnectionException $e) {
            throw new RuntimeException(
                'Unable to connect to Groq API.',
                0,
                $e
            );
        } catch (RequestException $e) {
            throw new RuntimeException(
                'Groq API returned an HTTP error: '
                . $e->response->status(),
                0,
                $e
            );
        }
    }
}

