<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Position;
use App\Models\User;
use App\Models\PayrollRecord;
use App\Models\PerformanceReview;
use Illuminate\Http\Request;

class MetricsController extends Controller
{
    private function ok(string $message, $data = null, int $code = 200)
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $code);
    }

    public function overview(Request $request)
    {
        $year = $request->integer('year', now()->year);

        $usersByRole = User::selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->orderByDesc('count')
            ->get();

        $payrollByStatus = PayrollRecord::selectRaw('status, COUNT(*) as count')
            ->where('period_year', $year)
            ->groupBy('status')
            ->orderByDesc('count')
            ->get();

        $avgScore = (float) PerformanceReview::avg('overall_score');

        $topDepartments = Position::selectRaw('department_id, COUNT(*) as positions_count')
            ->groupBy('department_id')
            ->orderByDesc('positions_count')
            ->limit(5)
            ->get();

        return $this->ok('App overview metrics.', [
            'year' => $year,

            'counts' => [
                'departments' => Department::count(),
                'positions' => Position::count(),
                'users' => User::count(),
                'payroll_records_in_year' => PayrollRecord::where('period_year', $year)->count(),
                'performance_reviews' => PerformanceReview::count(),
            ],

            'users' => [
                'active_users' => User::where('status', true)->count(),
                'by_role' => $usersByRole,
            ],

            'payroll' => [
                'sum_base_salary' => PayrollRecord::where('period_year', $year)->sum('base_salary'),
                'sum_net_amount' => PayrollRecord::where('period_year', $year)->sum('net_amount'),
                'by_status' => $payrollByStatus,
            ],

            'performance' => [
                'avg_score' => round($avgScore, 2),
                'salary_impact_reviews' => PerformanceReview::where('hasSalaryImpact', true)->count(),
            ],

            'departments' => [
                'top_by_positions' => $topDepartments,
            ],
        ]);
    }
}
