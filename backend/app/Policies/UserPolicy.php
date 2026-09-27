<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role?->name === 'admin';
    }

    // Просмотр конкретного профиля — сам пользователь или админ
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->role?->name === 'admin';
    }

    // Редактирование профиля — сам пользователь или админ
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->role?->name === 'admin';
    }
}
