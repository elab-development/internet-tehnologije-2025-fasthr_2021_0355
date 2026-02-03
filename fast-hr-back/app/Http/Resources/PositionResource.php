<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PositionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'name' => $this->name,
            'seniority_level' => $this->seniority_level,
            'min_salary' => $this->min_salary,
            'max_salary' => $this->max_salary,
            'default_benefits' => $this->default_benefits,

            // Po želji (ako je eager-loaded).
            'department' => $this->whenLoaded('department', fn () => [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ]),
        ];
    }
}
