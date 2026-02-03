<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PositionFactory extends Factory
{
    public function definition(): array
    {
        $min = $this->faker->numberBetween(800, 2500);
        $max = $min + $this->faker->numberBetween(300, 2500);

        return [
            'department_id' => null, // setuje se u seederu.
            'name' => $this->faker->randomElement([
                'Analyst',
                'Specialist',
                'Coordinator',
                'Engineer',
                'Manager',
                'Assistant',
            ]),
            'seniority_level' => $this->faker->randomElement([
                'junior',
                'mid',
                'senior',
                'lead',
            ]),
            'min_salary' => $min,
            'max_salary' => $max,
            'default_benefits' => [
                'private_health_insurance' => $this->faker->boolean(),
                'meal_vouchers' => $this->faker->boolean(),
                'gym_membership' => $this->faker->boolean(),
            ],
        ];
    }
}
