<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSmsLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
public function up()
{
    Schema::create('sms_logs', function (Blueprint $table) {
        $table->id();
        // Links to the users table (who clicked the broadcast button)
        $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); 
        $table->string('sender_role'); // e.g., 'Admin', 'Staff'
        $table->string('message', 280);
        $table->integer('recipients_count');
        $table->string('status')->default('success');
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
        Schema::dropIfExists('sms_logs');
    }
}
