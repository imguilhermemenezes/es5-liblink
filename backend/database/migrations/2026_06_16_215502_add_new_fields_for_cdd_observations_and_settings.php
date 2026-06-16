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
        Schema::table('books', function (Blueprint $table) {
            $table->string('cdd_cdu')->nullable()->after('genre');
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->text('return_observations')->nullable()->after('status');
        });

        Schema::table('schools', function (Blueprint $table) {
            $table->boolean('block_multiple_loans')->default(false)->after('max_books_per_student');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('cdd_cdu');
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->dropColumn('return_observations');
        });

        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn('block_multiple_loans');
        });
    }
};
