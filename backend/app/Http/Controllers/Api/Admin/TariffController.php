<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTariffRequest;
use App\Http\Requests\Admin\UpdateTariffRequest;
use App\Models\InsuranceCompany;
use App\Models\Tariff;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class TariffController extends Controller
{
    public function index(Request $request)
    {
        $query = Tariff::with(['insuranceType', 'company']);

        if ($typeId = $request->query('insurance_type_id')) {
            $query->where('insurance_type_id', $typeId);
        }

        return response()->json(['tariffs' => $query->get()]);
    }

    public function store(StoreTariffRequest $request)
    {
        $tariff = Tariff::create($request->validated());

        return response()->json(['tariff' => $tariff->load(['insuranceType', 'company'])], 201);
    }

    public function update(UpdateTariffRequest $request, Tariff $tariff)
    {
        $tariff->update($request->validated());

        return response()->json(['tariff' => $tariff->load(['insuranceType', 'company'])]);
    }

    public function destroy(Tariff $tariff)
    {
        try {
            $tariff->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Нельзя удалить тариф — есть связанные заявки.',
            ], 409);
        }

        return response()->json(['message' => 'Удалено']);
    }

    public function companies()
    {
        return response()->json(['companies' => InsuranceCompany::all()]);
    }
}
