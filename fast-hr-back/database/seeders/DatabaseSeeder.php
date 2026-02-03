<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Redosled je bitan zbog FK logike.
        $this->call([
            DepartmentSeeder::class,
            PositionSeeder::class,
            UserSeeder::class,
            PayrollRecordSeeder::class,
            PerformanceReviewSeeder::class,
        ]);
    }
}
