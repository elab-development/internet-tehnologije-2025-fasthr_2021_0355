<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name, // default users table.
            'email' => $this->email,
            'role' => $this->role,
            'status' => (bool) $this->status,
            'image_url' => $this->image_url,
            'position_id' => $this->position_id,

            'position' => $this->whenLoaded('position', fn () => [
                'id' => $this->position->id,
                'name' => $this->position->name,
                'department_id' => $this->position->department_id,
            ]),
        ];
    }
}
