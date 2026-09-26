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

    public function analyze(User $user, Application $application): bool
    {
        return $user->broker && $application->broker_id === $user->broker->id;
    }

    public function uploadDocument(User $user, Application $application): bool
    {
        return ($user->customer && $application->customer_id === $user->customer->id)
            || ($user->broker && $application->broker_id === $user->broker->id);
    }

    public function pay(User $user, Application $application): bool
    {
        return $user->customer && $application->customer_id === $user->customer->id;
    }

    private function owns(User $user, Application $application): bool
    {
        if ($user->customer && $application->customer_id === $user->customer->id) {
            return true;
        }

        if ($user->broker) {
    
            return $application->broker_id === $user->broker->id || $application->broker_id === null;
        }

        return false;
    }
}
