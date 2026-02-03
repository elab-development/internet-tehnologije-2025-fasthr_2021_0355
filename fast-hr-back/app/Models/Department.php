<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
       use HasFactory;
       
    protected $fillable = [
        'name',
        'description',
    ];

    // DEPARTMENT 1..1 -> POSITION 0..M
    public function positions()
    {
        return $this->hasMany(Position::class);
    }
}
