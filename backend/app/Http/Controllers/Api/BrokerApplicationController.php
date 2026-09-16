<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BrokerApplicationController extends Controller
{
    // Список заявок для брокера: его собственные назначенные +
    // общий пул неназначенных (broker_id ещё не проставлен никому)
    public function index(Request $request)
    {
        Gate::authorize('is-broker');

        $broker = $request->user()->broker;

        $query = Application::query()
            ->where(function ($q) use ($broker) {
                $q->whereNull('broker_id')->orWhere('broker_id', $broker->id);
            })
            ->with(['customer.user', 'insuranceType', 'tariff.company']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $applications = $query->latest()->get();

        return response()->json([
            'applications' => ApplicationResource::collection($applications),
        ]);
    }
}
