<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PerformanceReviewFactory extends Factory
{
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-6 months', '-2 months');
        $end = (clone $start)->modify('+30 days');

        return [
            'employee_id' => null,       // setuje se u seederu.
            'hr_worker_id' => null,      // setuje se u seederu.
            'payroll_record_id' => null, // setuje se u seederu.

            'period_start' => $start->format('Y-m-d'),
            'period_end' => $end->format('Y-m-d'),

            'overall_score' => $this->faker->randomFloat(2, 1, 5),
            'comments' => $this->faker->sentence(14),
            'goals' => $this->faker->sentence(12),

            'hasSalaryImpact' => $this->faker->boolean(30),
        ];
    }
}
