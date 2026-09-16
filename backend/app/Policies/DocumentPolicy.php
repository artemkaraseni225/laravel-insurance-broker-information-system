<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class DocumentPolicy
{
    public function view(User $user, Document $document): bool
    {
        return Gate::forUser($user)->allows('view', $document->application);
    }
}
