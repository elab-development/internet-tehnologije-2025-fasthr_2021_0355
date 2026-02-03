<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DepartmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Human Resources',
                'Finance',
                'IT',
                'Sales',
                'Marketing',
                'Operations',
            ]),
            'description' => $this->faker->sentence(10),
        ];
    }
}
