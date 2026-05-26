<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEvacuationCentersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
{
    Schema::create('evacuation_centers', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->integer('capacity'); // Maximum people it can hold
        $table->integer('current')->default(0); // Current number of people
        $table->enum('status', ['open', 'full', 'closed'])->default('closed');
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
        Schema::dropIfExists('evacuation_centers');
    }
}
