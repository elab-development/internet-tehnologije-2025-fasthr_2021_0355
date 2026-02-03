<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private function ok(string $message, $data = null, int $code = 200)
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $code);
    }

    public function index(Request $request)
    {
        $q = User::query()->with('position');

        if ($request->filled('role')) {
            $q->where('role', $request->string('role'));
        }

        if ($request->filled('status')) {
            $q->where('status', (bool) $request->input('status'));
        }

        $users = $q->orderBy('name')->get();

        return $this->ok('Users list.', [
            'items' => UserResource::collection($users),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:6', 'max:255'],

            'role' => ['required', Rule::in(['employee', 'hr_worker', 'admin'])],
            'status' => ['nullable', 'boolean'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
        ]);

        if ($validated['role'] === 'employee' && empty($validated['position_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Employee mora imati poziciju.',
                'errors' => ['position_id' => ['Position is required for employee.']],
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

        return $this->ok('User created.', [
            'user' => new UserResource($user->load('position')),
        ], 201);
    }

    public function show(User $user)
    {
        return $this->ok('User details.', [
            'user' => new UserResource($user->load('position')),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'email' => ['sometimes', 'required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6', 'max:255'],

            'role' => ['sometimes', 'required', Rule::in(['employee', 'hr_worker', 'admin'])],
            'status' => ['nullable', 'boolean'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
        ]);

        if (isset($validated['role']) && $validated['role'] === 'employee' && empty($validated['position_id']) && ! $user->position_id) {
            return response()->json([
                'success' => false,
                'message' => 'Employee mora imati poziciju.',
                'errors' => ['position_id' => ['Position is required for employee.']],
            ], 422);
        }

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if (isset($validated['role']) && $validated['role'] !== 'employee') {
            $validated['position_id'] = null;
        }

        $user->update($validated);

        return $this->ok('User updated.', [
            'user' => new UserResource($user->load('position')),
        ]);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return $this->ok('User deleted.', null);
    }

    public function stats()
    {
        $total = User::count();
        $active = User::where('status', true)->count();

        $byRole = User::selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->orderByDesc('count')
            ->get();

        return $this->ok('Users stats.', [
            'total_users' => $total,
            'active_users' => $active,
            'users_by_role' => $byRole,
        ]);
    }
}
