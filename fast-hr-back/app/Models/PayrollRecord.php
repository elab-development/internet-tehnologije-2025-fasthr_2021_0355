<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollRecord extends Model
{
    protected $fillable = [
        'employee_id',
        'hr_worker_id',
        'period_year',
        'period_month',
        'base_salary',
        'bonus_amount',
        'overtime_amount',
        'status',
        'benefits_amount',
        'net_amount',
        'deductions_amount',
    ];

    protected $casts = [
        'period_year' => 'integer',
        'period_month' => 'integer',
        'base_salary' => 'decimal:2',
        'bonus_amount' => 'decimal:2',
        'overtime_amount' => 'decimal:2',
        'benefits_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'deductions_amount' => 'decimal:2',
    ];

    // PAYROLL -> tačno jedan employee
    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    // PAYROLL -> tačno jedan hr_worker (obrađivač/odobrio)
    public function hrWorker()
    {
        return $this->belongsTo(User::class, 'hr_worker_id');
    }

    // PAYROLL 0..M -> PERFORMANCE REVIEW
    public function performanceReviews()
    {
        return $this->hasMany(PerformanceReview::class, 'payroll_record_id');
    }
}
