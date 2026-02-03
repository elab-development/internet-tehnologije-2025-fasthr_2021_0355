<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Position extends Model
{
   use HasFactory;

    protected $fillable = [
        'name',
        'department_id',
        'seniority_level',
        'min_salary',
        'max_salary',
        'default_benefits',
    ];

    protected $casts = [
        'min_salary' => 'decimal:2',
        'max_salary' => 'decimal:2',
        'default_benefits' => 'array',
    ];

    // POSITION 1..1 -> DEPARTMENT
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // POSITION 0..M -> USER
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
