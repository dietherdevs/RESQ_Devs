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
        // 1. Add new columns to Evacuation Centers
        Schema::table('evacuation_centers', function (Blueprint $table) {
            $table->string('location')->nullable();
            $table->text('contact')->nullable(); 
        });

        // 2. STEP ONE FOR EVACUEES: Drop Foreign Keys and Rename Columns FIRST
        Schema::table('evacuees', function (Blueprint $table) {
            $table->dropForeign(['evacuation_center_id']);
            $table->renameColumn('evacuation_center_id', 'center');
            $table->renameColumn('head_name', 'head');
        });

        // 3. STEP TWO FOR EVACUEES: Add and Change columns now that the new names are saved
        Schema::table('evacuees', function (Blueprint $table) {
            $table->string('center')->change(); // Now Laravel knows 'center' exists!
            
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            
            $table->integer('pwd')->default(0);
            $table->integer('seniors')->default(0);
            $table->integer('pregnant')->default(0);
            $table->integer('babies')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evacuation_centers', function (Blueprint $table) {
            $table->dropColumn(['location', 'contact']);
        });

        // Drop the newly added columns first
        Schema::table('evacuees', function (Blueprint $table) {
            $table->dropColumn(['phone', 'address', 'pwd', 'seniors', 'pregnant', 'babies']);
        });

        // Revert the names and types
        Schema::table('evacuees', function (Blueprint $table) {
            $table->renameColumn('head', 'head_name');
            $table->renameColumn('center', 'evacuation_center_id');
            $table->unsignedBigInteger('evacuation_center_id')->change();
        });
    }
};