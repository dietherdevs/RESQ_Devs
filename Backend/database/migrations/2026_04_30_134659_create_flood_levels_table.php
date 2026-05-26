<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFloodLevelsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
public function up()
{
    Schema::create('flood_levels', function (Blueprint $table) {
        $table->id();
        $table->string('obscd')->default('11104201'); // Sto. Niño code
        $table->decimal('water_level', 5, 2);
        $table->string('status'); 
        $table->timestamp('fetched_at'); // The 'timestr' from PAGASA
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
        Schema::dropIfExists('flood_levels');
    }
}
