<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class PerformanceReview extends Model
{
   use HasFactory, HasApiTokens;

    protected $fillable = [
        'employee_id',
        'hr_worker_id',
        'payroll_record_id',
        'period_start',
        'period_end',
        'overall_score',
        'comments',
        'goals',
        'hasSalaryImpact',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'overall_score' => 'decimal:2',
        'hasSalaryImpact' => 'boolean',
    ];

    // REVIEW -> tačno jedan employee
    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    // REVIEW -> tačno jedan hr_worker (ocenjivač)
    public function hrWorker()
    {
        return $this->belongsTo(User::class, 'hr_worker_id');
    }

    // REVIEW -> tačno jedan payroll record
    public function payrollRecord()
    {
        return $this->belongsTo(PayrollRecord::class, 'payroll_record_id');
    }
}
