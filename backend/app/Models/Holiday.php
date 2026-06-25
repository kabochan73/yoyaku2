<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = ['date'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }
}
