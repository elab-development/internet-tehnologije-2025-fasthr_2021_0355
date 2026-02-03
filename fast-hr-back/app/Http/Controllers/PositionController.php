<?php

namespace App\Http\Controllers;

use App\Http\Resources\PositionResource;
use App\Models\Position;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    private function ok(string $message, $data = null, int $code = 200)
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $code);
    }

    public function index(Request $request)
    {
        $q = Position::query()->with('department')->orderBy('name');

        if ($request->filled('department_id')) {
            $q->where('department_id', $request->integer('department_id'));
        }

        $positions = $q->get();

        return $this->ok('Positions list.', [
            'items' => PositionResource::collection($positions),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:255'],
            'seniority_level' => ['required', 'string', 'max:50'],
            'min_salary' => ['required', 'numeric', 'min:0'],
            'max_salary' => ['required', 'numeric', 'min:0'],
            'default_benefits' => ['nullable', 'array'],
        ]);

        $position = Position::create($validated);

        return $this->ok('Position created.', [
            'position' => new PositionResource($position->load('department')),
        ], 201);
    }

    public function show(Position $position)
    {
        return $this->ok('Position details.', [
            'position' => new PositionResource($position->load('department')),
        ]);
    }

    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'department_id' => ['sometimes', 'required', 'integer', 'exists:departments,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'seniority_level' => ['sometimes', 'required', 'string', 'max:50'],
            'min_salary' => ['sometimes', 'required', 'numeric', 'min:0'],
            'max_salary' => ['sometimes', 'required', 'numeric', 'min:0'],
            'default_benefits' => ['nullable', 'array'],
        ]);

        $position->update($validated);

        return $this->ok('Position updated.', [
            'position' => new PositionResource($position->load('department')),
        ]);
    }

    public function destroy(Position $position)
    {
        $position->delete();

        return $this->ok('Position deleted.', null);
    }

    public function stats()
    {
        $total = Position::count();
        $byDepartment = Position::selectRaw('department_id, COUNT(*) as count')
            ->groupBy('department_id')
            ->orderByDesc('count')
            ->get();

        return $this->ok('Positions stats.', [
            'total_positions' => $total,
            'by_department' => $byDepartment,
        ]);
    }
}
