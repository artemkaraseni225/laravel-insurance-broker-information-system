<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ApplicationResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Application\CreateApplicationRequest;
use App\Models\Application;
use App\Models\Tariff;
use App\Services\Insurance\CalculatorService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ApplicationController extends Controller
{
    public function __construct(private CalculatorService $calculatorService)
    {

    }

    public function index(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;

        $applications = $customer->applications()
            ->with(['insuranceType', 'tariff', 'policy'])
            ->latest()
            ->get();

        return response()->json([
            'applications' => $applications,
        ]);
    }

    public function show(Request $request, Application $application)
    {
        Gate::authorize('view', $application);

        $application->load(['customer.user', 'insuranceType', 'tariff.company', 'documents', 'statusHistories', 'policy']);

        return response()->json([
            'application' => new ApplicationResource($application),
        ]);
    }

    public function pay(Request $request, Application $application): JsonResponse
    {
        Gate::authorize('view', $application);

        if ($application->status !== ApplicationStatus::Approved) {
            throw ValidationException::withMessages([
                'application' => ['Оплатить можно только одобренную заявку.'],
            ]);
        }

        $termMonths = (int) data_get($application->insurance_data, 'term_months');

        if ($termMonths < 1) {
            throw ValidationException::withMessages([
                'term_months' => ['У заявки не указан корректный срок страхования.'],
            ]);
        }

        $policy = DB::transaction(function () use ($application, $termMonths) {
            $policy = $application->policy()->lockForUpdate()->firstOrFail();

            if ($policy->status !== 'paid') {
                $startDate = now();

                $policy->update([
                    'status' => 'paid',
                    'start_date' => $startDate,
                    'end_date' => $startDate->copy()->addMonthsNoOverflow($termMonths),
                ]);
                $policy->payments()->create([
                    'amount' => $policy->premium,
                    'status' => 'paid',
                    'payment_method' => 'card',
                    'paid_at' => now(),
                ]);
            }

            return $policy;
        });

        return response()->json([
            'policy' => $policy,
        ]);
    }

    public function store(CreateApplicationRequest $request)
    {
        // Заявки подаёт только клиент
        Gate::authorize('is-customer');

        $customer = $request->user()->customer;
        $data = $request->validated();

        $tariff = Tariff::with('insuranceType')->findOrFail($data['tariff_id']);

        if ($tariff->insuranceType->code !== $data['insurance_type']) {
            throw ValidationException::withMessages([
                'tariff_id' => ['Выбранный тариф не относится к указанному типу страхования.'],
            ]);
        }

        // Цену считаем на бэке заново через тот же CalculatorService,
        $price = $this->calculatorService->calculate($tariff, $data['insurance_type'], $data);

        // insurance_type/tariff_id уже есть в отдельных колонках —
        // в JSON кладём только специфичные для расчёта параметры
        $insuranceData = collect($data)->except(['insurance_type', 'tariff_id'])->toArray();

        $application = Application::create([
            'customer_id' => $customer->id,
            'insurance_type_id' => $tariff->insurance_type_id,
            'tariff_id' => $tariff->id,
            'status' => ApplicationStatus::New,
            'calculated_price' => $price,
            'insurance_data' => $insuranceData,
        ]);

        $application->statusHistories()->create([
            'from_status' => null,
            'to_status' => ApplicationStatus::New->value,
            'changed_by' => $request->user()->id,
            'note' => 'Заявка подана клиентом',
        ]);

        return response()->json([
            'application' => $application->load(['insuranceType', 'tariff.company']),
        ], 201);
    }
}
