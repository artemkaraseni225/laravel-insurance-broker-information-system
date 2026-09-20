<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreInsuranceTypeRequest;
use App\Http\Requests\Admin\UpdateInsuranceTypeRequest;
use App\Models\InsuranceType;
use Illuminate\Database\QueryException;

class InsuranceTypeController extends Controller
{
    private const KNOWN_CODES = ['auto', 'property', 'health'];

    public function index()
    {
        return response()->json([
            'insurance_types' => InsuranceType::withCount('tariffs')->get(),
        ]);
    }

    public function store(StoreInsuranceTypeRequest $request)
    {
        $insuranceType = InsuranceType::create($request->validated());

        return response()->json([
            'insurance_type' => $insuranceType,
            'warning' => $this->unknownCodeWarning($insuranceType->code),
        ], 201);
    }

    public function update(UpdateInsuranceTypeRequest $request, InsuranceType $insuranceType)
    {
        $insuranceType->update($request->validated());

        return response()->json([
            'insurance_type' => $insuranceType,
            'warning' => $this->unknownCodeWarning($insuranceType->code),
        ]);
    }

    public function destroy(InsuranceType $insuranceType)
    {
        try {
            $insuranceType->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Нельзя удалить тип страхования — есть связанные тарифы или заявки.',
            ], 409);
        }

        return response()->json(['message' => 'Удалено']);
    }

    private function unknownCodeWarning(string $code): ?string
    {
        if (in_array($code, self::KNOWN_CODES, true)) {
            return null;
        }

        return "Для типа с кодом \"{$code}\" нет калькулятора и формы заявки на фронтенде — их нужно добавить в коде, иначе клиент не сможет ни рассчитать цену, ни подать заявку по этому типу.";
    }
}
