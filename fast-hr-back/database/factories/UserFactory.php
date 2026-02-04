<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        // Simple, public, no API key avatar sources:
        // - pravatar.cc (small avatar, stable)
        // - i.pravatar.cc is also common.
        // We'll randomize by user ID-like seed so avatars differ.
        $avatarId = $this->faker->numberBetween(1, 70);

        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'role' => 'employee', // default, can be changed with state().
            'status' => true,

            // 70% users get an avatar, small size.
            // Example: https://i.pravatar.cc/80?img=12
            'image_url' => $this->faker->boolean(70)
                ? "https://i.pravatar.cc/80?img={$avatarId}"
                : null,

            'position_id' => null, // assigned in seeder for employees.
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
