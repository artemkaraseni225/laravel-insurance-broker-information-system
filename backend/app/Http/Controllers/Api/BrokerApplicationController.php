<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Enums\ApplicationStatus;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class BrokerApplicationController extends Controller
{
    // Общий пул заявок, которые ещё не взял в работу ни один брокер.
    public function index(Request $request)
    {
        Gate::authorize('is-broker');

        $query = Application::query()
            ->whereNull('broker_id')
            ->where('status', '!=', ApplicationStatus::Cancelled->value)
            ->with(['customer.user', 'insuranceType', 'tariff.company']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $applications = $query->latest()->get();

        return response()->json([
            'applications' => ApplicationResource::collection($applications),
        ]);
    }

    public function mine(Request $request)
    {
        Gate::authorize('is-broker');

        $applications = Application::query()
            ->where('broker_id', $request->user()->broker->id)
            ->with(['customer.user', 'insuranceType', 'tariff.company'])
            ->latest()
            ->get();

        return response()->json([
            'applications' => ApplicationResource::collection($applications),
        ]);
    }

    public function claim(Request $request, Application $application)
    {
        Gate::authorize('is-broker');

        $broker = $request->user()->broker;
        abort_unless($application->broker_id === null, 422, 'Заявка уже взята в работу.');

        $fromStatus = $application->status?->value;
        $claimed = Application::query()
            ->whereKey($application->id)
            ->whereNull('broker_id')
            ->update([
                'broker_id' => $broker->id,
                'status' => ApplicationStatus::InReview,
            ]);
        abort_unless($claimed === 1, 422, 'Заявка уже взята в работу.');
        $application->refresh();

        $application->statusHistories()->create([
            'from_status' => $fromStatus,
            'to_status' => ApplicationStatus::InReview->value,
            'changed_by' => $request->user()->id,
            'note' => 'Заявка взята брокером в работу',
        ]);

        return response()->json([
            'application' => new ApplicationResource(
                $application->load(['customer.user', 'insuranceType', 'tariff.company'])
            ),
        ]);
    }

    public function updateStatus(Request $request, Application $application)
    {
        Gate::authorize('is-broker');

        $broker = $request->user()->broker;
        abort_unless($application->broker_id === null || $application->broker_id === $broker->id, 403);
        abort_unless(in_array($application->status?->value, [
            ApplicationStatus::New->value,
            ApplicationStatus::InReview->value,
        ], true), 422, 'Статус этой заявки уже нельзя изменить.');

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                ApplicationStatus::Approved->value,
                ApplicationStatus::Rejected->value,
            ])],
        ]);

        $fromStatus = $application->status?->value;
        $application->update([
            'broker_id' => $application->broker_id ?? $broker->id,
            'status' => $validated['status'],
        ]);

        $application->statusHistories()->create([
            'from_status' => $fromStatus,
            'to_status' => $validated['status'],
            'changed_by' => $request->user()->id,
            'note' => $validated['status'] === ApplicationStatus::Approved->value
                ? 'Заявка одобрена брокером'
                : 'Заявка отклонена брокером',
        ]);

        return response()->json([
            'application' => new ApplicationResource(
                $application->load(['customer.user', 'insuranceType', 'tariff.company'])
            ),
        ]);
    }
}
