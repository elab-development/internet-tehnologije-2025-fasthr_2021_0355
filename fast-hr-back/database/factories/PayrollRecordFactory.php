<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PayrollRecordFactory extends Factory
{
    public function definition(): array
    {
        $base = $this->faker->numberBetween(1000, 3000);
        $bonus = $this->faker->boolean(35) ? $this->faker->numberBetween(50, 600) : 0;
        $overtime = $this->faker->boolean(30) ? $this->faker->numberBetween(20, 250) : 0;
        $benefits = $this->faker->boolean(60) ? $this->faker->numberBetween(30, 200) : 0;
        $deductions = $this->faker->numberBetween(0, 150);

        $net = ($base + $bonus + $overtime + $benefits) - $deductions;

        return [
            'employee_id' => null,   // setuje se u seederu.
            'hr_worker_id' => null,  // setuje se u seederu.

            'period_year' => now()->year,
            'period_month' => $this->faker->numberBetween(1, 12),

            'base_salary' => $base,
            'bonus_amount' => $bonus,
            'overtime_amount' => $overtime,

            'status' => $this->faker->randomElement(['draft', 'approved', 'paid']),

            'benefits_amount' => $benefits,
            'deductions_amount' => $deductions,
            'net_amount' => $net,
        ];
    }
}
