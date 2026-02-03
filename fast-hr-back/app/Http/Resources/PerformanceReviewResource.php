<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'employee_id' => $this->employee_id,
            'hr_worker_id' => $this->hr_worker_id,
            'payroll_record_id' => $this->payroll_record_id,

            'period_start' => $this->period_start,
            'period_end' => $this->period_end,

            'overall_score' => $this->overall_score,
            'comments' => $this->comments,
            'goals' => $this->goals,
            'hasSalaryImpact' => (bool) $this->hasSalaryImpact,

            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee->id,
                'name' => $this->employee->name,
                'email' => $this->employee->email,
            ]),

            'hr_worker' => $this->whenLoaded('hrWorker', fn () => [
                'id' => $this->hrWorker->id,
                'name' => $this->hrWorker->name,
                'email' => $this->hrWorker->email,
            ]),

            'payroll_record' => $this->whenLoaded('payrollRecord', fn () => [
                'id' => $this->payrollRecord->id,
                'period_year' => $this->payrollRecord->period_year,
                'period_month' => $this->payrollRecord->period_month,
                'status' => $this->payrollRecord->status,
            ]),
        ];
    }
}
