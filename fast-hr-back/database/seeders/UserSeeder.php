<?php

namespace Database\Seeders;

use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // HR workers.
        User::factory()->count(3)->hrWorker()->create();

        // Admin.
        User::factory()->count(1)->admin()->create();

        // Employees.
        $positions = Position::pluck('id');

        User::factory()
            ->count(20)
            ->employee()
            ->create([
                'position_id' => fn () => $positions->random(),
            ]);
    }
}
