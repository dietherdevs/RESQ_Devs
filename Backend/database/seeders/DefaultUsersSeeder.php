<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DefaultUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Admin Account
        User::create([
            'name' => 'Emmanuel John Umali',
            'email' => 'admin@resq.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Staff Account
        User::create([
            'name' => 'Shany Orias',
            'email' => 'staff@resq.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);

        // Standard User / Resident Account
        User::create([
            'name' => 'Beatriz Condino',
            'email' => 'user@resq.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
    }
}