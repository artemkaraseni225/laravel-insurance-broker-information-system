<?php

namespace App\Observers;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Services\Insurance\PolicyService;

class ApplicationObserver
{
    public function __construct(private PolicyService $policyService)
    {
    }

    public function updated(Application $application): void
    {
        // Полис создаём ровно один раз — когда статус реально
        // ИЗМЕНИЛСЯ на approved (не просто равен approved — иначе
        // сработало бы на каждое сохранение уже одобренной заявки)
        if (
            $application->wasChanged('status')
            && $application->status === ApplicationStatus::Approved
            && ! $application->policy()->exists()
        ) {
            $this->policyService->createFromApplication($application);
        }
    }
}
