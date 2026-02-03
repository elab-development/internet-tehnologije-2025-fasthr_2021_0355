<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'employee_id' => $this->employee_id,
            'hr_worker_id' => $this->hr_worker_id,

            'period_year' => $this->period_year,
            'period_month' => $this->period_month,

            'base_salary' => $this->base_salary,
            'bonus_amount' => $this->bonus_amount,
            'overtime_amount' => $this->overtime_amount,
            'benefits_amount' => $this->benefits_amount,
            'deductions_amount' => $this->deductions_amount,
            'net_amount' => $this->net_amount,

            'status' => $this->status,

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
        ];
    }
}
