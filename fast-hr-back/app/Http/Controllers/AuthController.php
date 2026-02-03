<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    private function ok(string $message, $data = null, int $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    private function fail(string $message, array $errors = [], int $code = 422)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:6', 'max:255'],

            'role' => ['required', Rule::in(['employee', 'hr_worker', 'admin'])],
            'status' => ['nullable', 'boolean'],
            'image_url' => ['nullable', 'string', 'max:255'],

            // Employee mora imati poziciju.
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
        ]);

        if ($validated['role'] === 'employee' && empty($validated['position_id'])) {
            return $this->fail('Employee mora imati poziciju.', [
                'position_id' => ['Position is required for employee.'],
            ], 422);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => $validated['status'] ?? true,
            'image_url' => $validated['image_url'] ?? null,
            'position_id' => $validated['role'] === 'employee' ? $validated['position_id'] : null,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return $this->ok('Registracija uspešna.', [
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:150'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->fail('Neispravni kredencijali.', [
                'auth' => ['Email ili lozinka nisu tačni.'],
            ], 401);
        }

        if (! $user->status) {
            return $this->fail('Nalog nije aktivan.', [
                'auth' => ['Kontaktirajte administratora.'],
            ], 403);
        }

        $token = $user->createToken('api')->plainTextToken;

        return $this->ok('Prijava uspešna.', [
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->ok('Odjava uspešna.', null);
    }
}
