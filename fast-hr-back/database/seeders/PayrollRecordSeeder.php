<?php

namespace Database\Seeders;

use App\Models\PayrollRecord;
use App\Models\User;
use Illuminate\Database\Seeder;

class PayrollRecordSeeder extends Seeder
{
    public function run(): void
    {
        $employees = User::where('role', 'employee')->with('position')->get();
        $hrWorkers = User::where('role', 'hr_worker')->pluck('id');

        // Kreiramo 3 poslednja meseca po zaposlenom (bez duplikata zbog unique(employee_id,year,month)).
        foreach ($employees as $employee) {
            for ($i = 0; $i < 3; $i++) {
                $date = now()->subMonths($i);

                $min = (float) ($employee->position?->min_salary ?? 1200);
                $max = (float) ($employee->position?->max_salary ?? 2500);

                $base = rand((int)$min, (int)$max);
                $bonus = rand(0, 1) ? rand(0, 500) : 0;
                $overtime = rand(0, 1) ? rand(0, 200) : 0;
                $benefits = rand(0, 1) ? rand(0, 150) : 0;
                $deductions = rand(0, 150);
                $net = ($base + $bonus + $overtime + $benefits) - $deductions;

                PayrollRecord::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'period_year' => (int) $date->year,
                        'period_month' => (int) $date->month,
                    ],
                    [
                        'hr_worker_id' => $hrWorkers->random(),
                        'base_salary' => $base,
                        'bonus_amount' => $bonus,
                        'overtime_amount' => $overtime,
                        'status' => collect(['draft', 'approved', 'paid'])->random(),
                        'benefits_amount' => $benefits,
                        'deductions_amount' => $deductions,
                        'net_amount' => $net,
                    ]
                );
            }
        }
    }
}
