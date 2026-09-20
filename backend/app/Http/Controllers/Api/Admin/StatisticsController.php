<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function index(): JsonResponse
    {
        $statusCounts = Application::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $applicationsByType = Application::query()
            ->join('insurance_types', 'insurance_types.id', '=', 'applications.insurance_type_id')
            ->select('insurance_types.name', DB::raw('COUNT(applications.id) as total'))
            ->groupBy('insurance_types.id', 'insurance_types.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->name,
                'total' => (int) $item->total,
            ])
            ->values();

        $paidPayments = Payment::query()
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', now()->subMonths(5)->startOfMonth())
            ->get(['amount', 'paid_at']);

        $monthlyPremiums = collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($paidPayments) {
                $month = now()->subMonths($monthsAgo)->startOfMonth();

                return [
                    'month' => $month->format('Y-m'),
                    'label' => $month->translatedFormat('M Y'),
                    'amount' => (float) $paidPayments
                        ->filter(fn ($payment) => Carbon::parse($payment->paid_at)->isSameMonth($month))
                        ->sum('amount'),
                ];
            })
            ->values();

        return response()->json([
            'total_applications' => (int) $statusCounts->sum(),
            'collected_premiums' => (float) Payment::query()
                ->where('status', 'paid')
                ->sum('amount'),
            'status_counts' => collect(ApplicationStatus::cases())
                ->mapWithKeys(fn (ApplicationStatus $status) => [
                    $status->value => (int) ($statusCounts[$status->value] ?? 0),
                ]),
            'applications_by_type' => $applicationsByType,
            'monthly_premiums' => $monthlyPremiums,
        ]);
    }
}