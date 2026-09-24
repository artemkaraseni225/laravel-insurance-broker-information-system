<?php

namespace App\Services\AI;

use RuntimeException;

class AiDataExtractionService
{
    /**
     * Поля, которые AI может извлекать из свободного текста клиента
     */
    private const SCHEMAS = [
        'auto' => [
            'car_brand' => 'Марка автомобиля (строка)',
            'car_model' => 'Модель автомобиля (строка)',
            'license_plate' => 'Государственный номер автомобиля (строка)',
            'vin_or_tech_passport' => 'VIN-код или номер техпаспорта (строка)',
            'engine_volume' => 'Объём двигателя в литрах (число, например 1.6)',
            'driving_experience_years' => 'Стаж вождения в полных годах (целое число)',
            'idnp' => 'IDNP клиента, 13 цифр (строка)',
            'insurance_sum' => 'Оценочная стоимость автомобиля (число)',
            'age' => 'Возраст клиента (целое число)',
            'had_accidents' => 'Были ли аварии (true или false)',
        ],

        'property' => [
            'property_address' => 'Точный адрес объекта: город, улица, дом, квартира - опционально (строка)',
            'property_type' => 'Тип объекта: apartment или house',
            'area_sqm' => 'Площадь объекта в квадратных метрах (число). Извлекай число и из приблизительных формулировок: «где-то 50», «около 50», «примерно 50 кв. м» нужно вернуть как 50.',
            'property_value' => 'Стоимость имущества (число)',
            'idnp' => 'IDNP клиента, 13 цифр (строка)',
            'has_risk_factors' => 'Явно сообщил ли клиент, что есть факторы риска (true или false). Не выводи это поле из наличия деревянных перекрытий, печного отопления или других полей.',
        ],

        'health' => [
            'age' => 'Возраст клиента (целое число)',
            'date_of_birth' => 'Дата рождения в формате YYYY-MM-DD',
            'idnp' => 'IDNP, 13 цифр (строка)',
        ],
    ];

    public function __construct(
        protected AiAssistantService $aiAssistant
    ) {
    }

    /**
     * Извлекает структурированные данные
     * из свободного текста клиента.
     */
    public function extractData(
        string $insuranceTypeCode,
        string $clientMessage
    ): array {
        $schema = self::SCHEMAS[$insuranceTypeCode] ?? null;

        if (!$schema) {
            throw new RuntimeException(
                "Unknown insurance type: {$insuranceTypeCode}"
            );
        }

        $prompt = $this->buildPrompt(
            $insuranceTypeCode,
            $schema,
            $clientMessage
        );

        $raw = $this->aiAssistant->ask($prompt);

        return $this->parseResponse($raw, $schema);
    }

    /**
     * Формирует prompt для AI.
     */
    protected function buildPrompt(
        string $insuranceTypeCode,
        array $schema,
        string $clientMessage
    ): string {
        $fieldsList = collect($schema)
            ->map(
                fn ($description, $key) =>
                    "- \"{$key}\": {$description}"
            )
            ->implode("\n");

        return <<<PROMPT
Ты — AI-модуль системы страхового брокера.

Твоя задача — извлечь структурированные данные
из свободного текста клиента для автоматического
заполнения формы страховой заявки.

Тип страхования: {$insuranceTypeCode}

ОСНОВНОЙ ПРИНЦИП: каждое поле оценивается НЕЗАВИСИМО от остальных, только по 
прямому и явному упоминанию в тексте. Наличие или отсутствие одного факта 
никогда не является основанием для заполнения другого поля. Описание 
происшествия, случая или ситуации — это отдельная информация, а не повод 
делать выводы о других полях (рисках, опциях, характеристиках объекта и т.п.).

Извлекай ТОЛЬКО информацию, которая явно присутствует в сообщении клиента. 
НЕ ПРИДУМЫВАЙ значения. 
Если поле отсутствует, неизвестно, неоднозначно или 
его можно только предположить — используй null.

Никогда не делай выводов на основе других полей.
Если явного упоминания в тексте нет — верни null,
даже если другие детали могут на это намекать.

Верни ТОЛЬКО валидный JSON без Markdown,
пояснений и дополнительного текста.

Разрешённые поля:

{$fieldsList}

Правила форматирования значений:
- Числовые значения возвращай как числа (int/float), не как строки.
- Для чисел (площадь, объём, стаж и т.п.) извлекай значение из приблизительных 
  формулировок: «где-то 50», «около 50», «может чуть больше 50» → 50.
- Для денежных сумм убирай валюту и разделители тысяч: «500000 лей», 
  «500 000 MDL», «около 500.000 лей» → 500000 (число, без валюты).
- IDNP возвращай, только если в тексте есть последовательность ровно из 
  13 цифр подряд. Если цифр больше или меньше 13 — верни null.
- Boolean-поля возвращай как true или false, только если есть прямое 
  утверждение или отрицание именно этого факта. Любая неопределённость → null.
- Если клиент сам исправляет значение в пределах одного сообщения 
  («50 метров, ой, вернее 55») — используй последнее по тексту значение.
- Если информация противоречива и непонятно, какое значение верное — 
  используй null вместо самостоятельного выбора.

Дополнительные правила:

- Не добавляй поля, которых нет в списке.
- Не изменяй названия полей.
- Не делай предположений на основе контекста.




Сообщение клиента:

{$clientMessage}
PROMPT;
    }

    /**
     * Проверяет и нормализует ответ AI.
     */
    protected function parseResponse(
        string $raw,
        array $schema
    ): array {
        $result = json_decode($raw, true);

        if (
            json_last_error() !== JSON_ERROR_NONE ||
            !is_array($result)
        ) {
            throw new RuntimeException(
                'AI returned invalid JSON.'
            );
        }

        /*
         * Оставляем только поля,
         * которые разрешены текущей схемой.
         */
        $result = array_intersect_key(
            $result,
            $schema
        );

        /*
         * Гарантируем наличие всех ожидаемых полей.
         * Если AI не вернул поле — ставим null.
         */
        foreach ($schema as $key => $description) {
            if (!array_key_exists($key, $result)) {
                $result[$key] = null;
            }
        }

        return $result;
    }

    public static function schemaFor(
        string $insuranceTypeCode
    ): ?array {
        return self::SCHEMAS[$insuranceTypeCode] ?? null;
    }
}

