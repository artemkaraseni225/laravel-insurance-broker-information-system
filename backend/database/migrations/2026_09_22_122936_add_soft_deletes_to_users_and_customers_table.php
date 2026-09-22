<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {$table->softDeletes(); // Добавляет nullable timestamp колонку `deleted_at`
        });

        Schema::table('customers', function (Blueprint $table) {$table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {$table->dropSoftDeletes(); // Удаляет колонку `deleted_at` при откате
        });

        Schema::table('customers', function (Blueprint $table) {$table->dropSoftDeletes();
        });
    }
};