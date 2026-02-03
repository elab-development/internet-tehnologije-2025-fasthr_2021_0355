<?php

namespace App\Http\Controllers;

use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    private function ok(string $message, $data = null, int $code = 200)
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $code);
    }

    public function index()
    {
        $departments = Department::orderBy('name')->get();

        return $this->ok('Departments list.', [
            'items' => DepartmentResource::collection($departments),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $department = Department::create($validated);

        return $this->ok('Department created.', [
            'department' => new DepartmentResource($department),
        ], 201);
    }

    public function show(Department $department)
    {
        return $this->ok('Department details.', [
            'department' => new DepartmentResource($department),
        ]);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $department->update($validated);

        return $this->ok('Department updated.', [
            'department' => new DepartmentResource($department),
        ]);
    }

    public function destroy(Department $department)
    {
        $department->delete();

        return $this->ok('Department deleted.', null);
    }

    // Jednostavna metrika.
    public function stats()
    {
        $total = Department::count();

        return $this->ok('Departments stats.', [
            'total_departments' => $total,
        ]);
    }
}
