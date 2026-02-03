<?php

namespace Database\Seeders;

use App\Models\PayrollRecord;
use App\Models\PerformanceReview;
use App\Models\User;
use Illuminate\Database\Seeder;

class PerformanceReviewSeeder extends Seeder
{
    public function run(): void
    {
        $employees = User::where('role', 'employee')->pluck('id');
        $hrWorkers = User::where('role', 'hr_worker')->pluck('id');

        foreach ($employees as $employeeId) {
            // Uzmi najnoviji payroll record za tog zaposlenog.
            $payroll = PayrollRecord::where('employee_id', $employeeId)
                ->orderByDesc('period_year')
                ->orderByDesc('period_month')
                ->first();

            if (!$payroll) {
                continue;
            }

            // 0-2 review-a po zaposlenom.
            $count = rand(0, 2);

            for ($i = 0; $i < $count; $i++) {
                PerformanceReview::factory()->create([
                    'employee_id' => $employeeId,
                    'hr_worker_id' => $hrWorkers->random(),
                    'payroll_record_id' => $payroll->id,
                ]);
            }
        }
    }
}
