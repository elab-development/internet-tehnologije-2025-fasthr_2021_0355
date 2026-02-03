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

        // Dovoljno široka lista da u svakom department-u uzmemo 3 različita naziva.
        $positionNames = [
            'Analyst',
            'Specialist',
            'Coordinator',
            'Engineer',
            'Manager',
            'Assistant',
            'Consultant',
            'Administrator',
            'Associate',
            'Officer',
        ];

        foreach ($departments as $department) {
            // Uzmi 3 različita naziva za ovaj department.
            $namesForDepartment = collect($positionNames)->shuffle()->take(3)->values();

            foreach ($namesForDepartment as $name) {
                Position::factory()->create([
                    'department_id' => $department->id,
                    'name' => $name,
                ]);
            }
        }
    }
}
