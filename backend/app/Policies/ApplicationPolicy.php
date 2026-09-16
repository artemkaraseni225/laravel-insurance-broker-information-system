<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    public function view(User $user, Application $application): bool
    {
        return $this->owns($user, $application) || $user->role?->name === 'admin';
    }

    public function uploadDocument(User $user, Application $application): bool
    {
        return $this->owns($user, $application);
    }

    private function owns(User $user, Application $application): bool
    {
        if ($user->customer && $application->customer_id === $user->customer->id) {
            return true;
        }

        if ($user->broker) {
            // Брокер видит СВОИ назначенные заявки И общий пул
            // неназначенных (broker_id ещё null) — назначение
            // происходит в момент решения (approve/reject), не раньше
            return $application->broker_id === $user->broker->id || $application->broker_id === null;
        }

        return false;
    }
}
