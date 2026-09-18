<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('broker_id')->nullable()->constrained('brokers')->nullOnDelete();
            $table->foreignId('insurance_type_id')->constrained('insurance_types')->restrictOnDelete();
            $table->foreignId('tariff_id')->constrained('tariffs')->restrictOnDelete();
            $table->string('status', 50)->default('new');
            $table->decimal('calculated_price', 12, 2);
            $table->json('insurance_data');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
