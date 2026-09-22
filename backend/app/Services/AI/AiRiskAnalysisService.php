<?php

namespace App\Services\AI;

use App\Models\Application;
use RuntimeException;

class AiRiskAnalysisService
{
    public function __construct(
        protected AiAssistantService $aiAssistant
    ) {
    }

    public function analyze(Application $application): array
    {
        $data = $this->extractApplicationData($application);

        $prompt = $this->buildPrompt($data);

        $raw = $this->aiAssistant->ask($prompt);

        return $this->parseResponse($raw);
    }

    protected function extractApplicationData(Application $application): array
    {
        $application->loadMissing([
            'insuranceType',
            'tariff',
            'customer',
        ]);

        $data = [
            'insurance_type' => $application->insuranceType?->name,
            'insurance_type_code' => $application->insuranceType?->code,
            'tariff' => $application->tariff?->name,
            'calculated_price_mdl' => $application->calculated_price,
        ];

        if ($application->customer?->date_of_birth) {
            $data['customer_age'] = $application->customer->date_of_birth->age;
        }

        /*
         * Не передаём AI персональные идентификаторы,
         * которые не нужны для анализа риска.
         */
        $piiKeys = [
            'idnp',
            'vin',
            'tech_passport',
            'license_plate',
            'plate_number',
            'address',
            'full_address',
            'phone',
            'email',
        ];

        $safeInsuranceData = collect($application->insurance_data ?? [])
            ->except($piiKeys)
            ->toArray();

        return array_filter(
            array_merge($data, $safeInsuranceData),
            fn ($value) => $value !== null && $value !== ''
        );
    }

    protected function buildPrompt(array $data): string
    {
        $lines = [];

        foreach ($data as $key => $value) {
            if (is_bool($value)) {
                $value = $value ? 'да' : 'нет';
            }

            if (is_array($value)) {
                $value = json_encode(
                    $value,
                    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
                );
            }

            $lines[] = "- {$key}: {$value}";
        }

        $applicationData = implode("\n", $lines);

        return <<<PROMPT
Ты — AI-ассистент страхового брокера для анализа потенциального риска страховой заявки.

Твоя задача — проанализировать предоставленные данные и подготовить
рекомендацию для брокера.

ВАЖНЫЕ ПРАВИЛА:

1. Ты НЕ принимаешь окончательное решение по заявке.
2. Ты НЕ одобряешь и НЕ отклоняешь заявку.
3. Ты НЕ назначаешь страховую надбавку.
4. Ты НЕ изменяешь тариф и цену страхования.
5. Окончательное решение всегда принимает брокер.
6. Не придумывай отсутствующие данные.
7. Если информации недостаточно, укажи это среди факторов риска.
8. Анализируй только предоставленные данные заявки.

Верни ТОЛЬКО валидный JSON без Markdown и без дополнительного текста.

ВАЖНО О ВАЛЮТЕ:

1. Все денежные значения заявки указаны в MDL (молдавских леях).
2. Не конвертируй суммы в RUB, USD, EUR или любую другую валюту.
3. Если в рекомендации или факторах упоминается денежная сумма,
   обязательно указывай её в MDL.
4. Не предполагай другую валюту, даже если сумма выглядит необычно.

Формат ответа:

{
    "risk_level": "LOW",
    "factors": [
        "краткий фактор 1",
        "краткий фактор 2"
    ],
    "recommendation": "Краткая рекомендация брокеру.",
    "data_quality_score": 0.85
}

Язык ответа:

- Все текстовые поля ответа должны быть написаны ТОЛЬКО на русском языке.
- Это относится к полям "factors" и "recommendation".
- Не используй английский язык в текстовых полях.
- Технические значения "LOW", "MEDIUM", "HIGH" должны оставаться на английском языке.

Требования:

risk_level:
- только LOW, MEDIUM или HIGH.

factors:
- массив строк;
- укажи основные факторы, повлиявшие на оценку;
- не придумывай факторы, которых нет в данных.

recommendation:
- рекомендация именно для брокера;
- не должна содержать окончательного решения approve/reject;
- брокер самостоятельно принимает окончательное решение.

"data_quality_score": число от 0.1 до 1.0. 
Оцени семантическое качество и конкретику предоставленных данных. 
Ставь 1.0, если данные исчерпывающие (точные цифры стажа, характеристик авто). 
Ставь ниже 0.5, если данные размыты (например, "большой стаж" вместо точного количества лет) и для точной оценки риска требуется запросить у клиента детали.

Данные заявки:

{$applicationData}
PROMPT;
    }

    protected function parseResponse(?string $raw): array
    {
        if (!$raw) {
            throw new RuntimeException(
                'AI returned an empty response.'
            );
        }

        $clean = trim($raw);

        /*
         * Дополнительная защита на случай,
         * если модель вернула JSON внутри Markdown-блока.
         */
        $clean = preg_replace(
            '/^```(?:json)?\s*|\s*```$/i',
            '',
            $clean
        );

        $result = json_decode($clean, true);

        if (
            json_last_error() !== JSON_ERROR_NONE ||
            !is_array($result)
        ) {
            throw new RuntimeException(
                'AI returned invalid JSON.'
            );
        }

        $allowedLevels = [
            'LOW',
            'MEDIUM',
            'HIGH',
        ];

        if (
            !isset($result['risk_level']) ||
            !is_string($result['risk_level'])
        ) {
            throw new RuntimeException(
                'AI response does not contain a valid risk_level.'
            );
        }

        $riskLevel = strtoupper($result['risk_level']);

        if (!in_array($riskLevel, $allowedLevels, true)) {
            throw new RuntimeException(
                'AI returned an invalid risk_level.'
            );
        }

        if (
            !isset($result['factors']) ||
            !is_array($result['factors'])
        ) {
            throw new RuntimeException(
                'AI response does not contain valid factors.'
            );
        }

        if (
            !isset($result['recommendation']) ||
            !is_string($result['recommendation'])
        ) {
            throw new RuntimeException(
                'AI response does not contain a valid recommendation.'
            );
        }

        if (
            !isset($result['data_quality_score']) ||
            !is_numeric($result['data_quality_score'])
        ) {
            throw new RuntimeException(
                'AI response does not contain valid data quality score.'
            );
        }

        $dataQualityScore = (float) $result['data_quality_score'];

        if ($dataQualityScore < 0.1 || $dataQualityScore > 1.0) {
            throw new RuntimeException(
                'AI data quality score must be between 0.1 and 1.0.'
            );
        }

        return [
            'risk_level' => $riskLevel,
            'factors' => $result['factors'],
            'recommendation' => $result['recommendation'],
            'data_quality_score' => $dataQualityScore,
        ];
    }
}

