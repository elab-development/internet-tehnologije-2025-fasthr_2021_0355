<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use Notifiable;
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'image_url',
        'position_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    // POSITION (employee -> 1..1, ostali korisnici mogu imati null)
    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    // PERFORMANCE REVIEW (kao employee)
    public function performanceReviews()
    {
        return $this->hasMany(PerformanceReview::class, 'employee_id');
    }

    // PERFORMANCE REVIEW (kao hr_worker koji je kreirao)
    public function createdPerformanceReviews()
    {
        return $this->hasMany(PerformanceReview::class, 'hr_worker_id');
    }

    // PAYROLL RECORD (kao employee)
    public function payrollRecords()
    {
        return $this->hasMany(PayrollRecord::class, 'employee_id');
    }

    // PAYROLL RECORD (kao hr_worker koji je obradio/odobrio)
    public function processedPayrollRecords()
    {
        return $this->hasMany(PayrollRecord::class, 'hr_worker_id');
    }
}
