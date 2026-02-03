<?php

namespace App\Http\Controllers;

use App\Http\Resources\PerformanceReviewResource;
use App\Models\PerformanceReview;
use Illuminate\Http\Request;

class PerformanceReviewController extends Controller
{
    private function ok(string $message, $data = null, int $code = 200)
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $code);
    }

    public function index(Request $request)
    {
        $q = PerformanceReview::query()
            ->with(['employee', 'hrWorker', 'payrollRecord'])
            ->orderByDesc('period_end');

        if ($request->filled('employee_id')) {
            $q->where('employee_id', $request->integer('employee_id'));
        }
        if ($request->filled('hr_worker_id')) {
            $q->where('hr_worker_id', $request->integer('hr_worker_id'));
        }
        if ($request->filled('payroll_record_id')) {
            $q->where('payroll_record_id', $request->integer('payroll_record_id'));
        }
        if ($request->filled('hasSalaryImpact')) {
            $q->where('hasSalaryImpact', (bool) $request->input('hasSalaryImpact'));
        }

        $items = $q->get();

        return $this->ok('Performance reviews list.', [
            'items' => PerformanceReviewResource::collection($items),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:users,id'],
            'hr_worker_id' => ['required', 'integer', 'exists:users,id'],
            'payroll_record_id' => ['required', 'integer', 'exists:payroll_records,id'],

            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],

            'overall_score' => ['required', 'numeric', 'min:0', 'max:5'],
            'comments' => ['nullable', 'string'],
            'goals' => ['nullable', 'string'],
            'hasSalaryImpact' => ['nullable', 'boolean'],
        ]);

        $review = PerformanceReview::create($validated);

        return $this->ok('Performance review created.', [
            'performance_review' => new PerformanceReviewResource($review->load(['employee', 'hrWorker', 'payrollRecord'])),
        ], 201);
    }

    public function show(PerformanceReview $performanceReview)
    {
        return $this->ok('Performance review details.', [
            'performance_review' => new PerformanceReviewResource($performanceReview->load(['employee', 'hrWorker', 'payrollRecord'])),
        ]);
    }

    public function update(Request $request, PerformanceReview $performanceReview)
    {
        $validated = $request->validate([
            'employee_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'hr_worker_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'payroll_record_id' => ['sometimes', 'required', 'integer', 'exists:payroll_records,id'],

            'period_start' => ['sometimes', 'required', 'date'],
            'period_end' => ['sometimes', 'required', 'date'],

            'overall_score' => ['sometimes', 'required', 'numeric', 'min:0', 'max:5'],
            'comments' => ['nullable', 'string'],
            'goals' => ['nullable', 'string'],
            'hasSalaryImpact' => ['nullable', 'boolean'],
        ]);

        // Ako oba stižu, proveri.
        if (isset($validated['period_start']) && isset($validated['period_end'])) {
            if (strtotime($validated['period_end']) < strtotime($validated['period_start'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Period end mora biti >= period start.',
                    'errors' => ['period_end' => ['period_end must be after or equal to period_start.']],
                ], 422);
            }
        }

        $performanceReview->update($validated);

        return $this->ok('Performance review updated.', [
            'performance_review' => new PerformanceReviewResource($performanceReview->load(['employee', 'hrWorker', 'payrollRecord'])),
        ]);
    }

    public function destroy(PerformanceReview $performanceReview)
    {
        $performanceReview->delete();

        return $this->ok('Performance review deleted.', null);
    }

    public function stats()
    {
        $total = PerformanceReview::count();
        $avgScore = (float) PerformanceReview::avg('overall_score');
        $salaryImpactCount = PerformanceReview::where('hasSalaryImpact', true)->count();

        return $this->ok('Performance reviews stats.', [
            'total_reviews' => $total,
            'average_overall_score' => round($avgScore, 2),
            'reviews_with_salary_impact' => $salaryImpactCount,
        ]);
    }
}
