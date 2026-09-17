<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PolicyResource;
use App\Models\Policy;
use Illuminate\Http\Request;

class PolicyController extends Controller
{
    public function index(Request $request)
    {
        $policies = $this->customerPolicies($request)
            ->where('status', 'paid')
            ->latest()
            ->get();

        return response()->json([
            'policies' => PolicyResource::collection($policies),
        ]);
    }

    public function show(Request $request, Policy $policy)
    {
        $policy = $this->customerPolicies($request)
            ->whereKey($policy->id)
            ->firstOrFail();

        return response()->json([
            'policy' => new PolicyResource($policy),
        ]);
    }

    private function customerPolicies(Request $request)
    {
        return Policy::query()
            ->whereHas('application.customer', fn ($query) =>
                $query->where('user_id', $request->user()->id)
            )
            ->with([
                'application.insuranceType',
                'application.customer.user',
                'application.broker.user',
                'application.tariff.company',
                'payments',
            ]);
    }
}