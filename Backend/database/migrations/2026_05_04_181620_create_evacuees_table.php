<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEvacueesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
{
    Schema::create('evacuees', function (Blueprint $table) {
        $table->id();
        // Links this evacuee to a specific center
        $table->foreignId('evacuation_center_id')->constrained()->onDelete('cascade'); 
        $table->string('head_name'); // Head of the family
        $table->integer('total'); // Total number of family members
        $table->string('barangay'); 
        $table->enum('status', ['evacuated', 'returned'])->default('evacuated');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('evacuees');
    }
}
