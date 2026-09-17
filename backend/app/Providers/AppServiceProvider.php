<?php

namespace App\Providers;

use App\Models\Application;
use App\Models\Document;
use App\Models\User;
use App\Policies\ApplicationPolicy;
use App\Observers\ApplicationObserver;
use App\Policies\DocumentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::define('is-admin', fn ($user) => $user->role?->name === 'admin');
        Gate::define('is-broker', fn ($user) => $user->role?->name === 'broker');
        Gate::define('is-customer', fn ($user) => $user->role?->name === 'customer');

        // Policy — привязана к конкретной записи. 
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Application::class, ApplicationPolicy::class);
        Gate::policy(Document::class, DocumentPolicy::class);

        Application::observe(ApplicationObserver::class);
    }
}
