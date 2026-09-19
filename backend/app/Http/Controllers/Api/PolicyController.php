<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PolicyResource;
use App\Models\Policy;
use Dompdf\Dompdf;
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

    public function pdf(Request $request, Policy $policy)
    {
        $policy = $this->customerPolicies($request)
            ->whereKey($policy->id)
            ->firstOrFail();

        $pdf = new Dompdf();
        $pdf->loadHtml(view('policies.pdf', compact('policy'))->render(), 'UTF-8');
        $pdf->setPaper('A4');
        $pdf->render();

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="policy-' . $policy->policy_number . '.pdf"',
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
                'application.documents',
                'payments',
            ]);
    }
}