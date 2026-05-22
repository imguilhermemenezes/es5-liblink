<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->string('document')->unique()->nullable(); // CPF or INEP
            $table->string('role')->default('bibliotecario'); // gestor, bibliotecario
            $table->boolean('status')->default(true); // active or inactive
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->dropColumn(['school_id', 'document', 'role', 'status']);
            $table->dropSoftDeletes();
        });
    }
};
