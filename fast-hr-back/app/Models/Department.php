<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
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
