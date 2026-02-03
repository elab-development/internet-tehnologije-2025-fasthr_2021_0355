<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();

        foreach ($departments as $department) {
            Position::factory()
                ->count(3)
                ->create([
                    'department_id' => $department->id,
                ]);
        }
    }
}
