<?php

namespace Database\Seeders;

use App\Models\Pricing;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => '管理者',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        Pricing::firstOrCreate(
            [],
            [
                'base_price' => 10000,
                'extra_hour_price' => 5000,
            ]
        );
    }
}
