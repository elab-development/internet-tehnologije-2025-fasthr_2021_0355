<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'role' => 'employee', // default, može se menjati state-om.
            'status' => true,
            'image_url' => $this->faker->boolean(70) ? $this->faker->imageUrl(256, 256, 'people') : null,
            'position_id' => null, // setuje se u seederu za employe-e.
            'remember_token' => Str::random(10),
        ];
    }

    public function employee(): static
    {
        return $this->state(fn () => [
            'role' => 'employee',
            'status' => true,
        ]);
    }

    public function hrWorker(): static
    {
        return $this->state(fn () => [
            'role' => 'hr_worker',
            'status' => true,
            'position_id' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn () => [
            'role' => 'admin',
            'status' => true,
            'position_id' => null,
        ]);
    }
}
