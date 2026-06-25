<?php

namespace Database\Factories;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    public function definition(): array
    {
        $start = Carbon::tomorrow()->setHour(10)->setMinute(0)->setSecond(0);
        $hours = 2;

        return [
            'user_id' => User::factory(),
            'start_datetime' => $start,
            'end_datetime' => $start->copy()->addHours($hours),
            'hours' => $hours,
            'total_price' => 10000,
            'status' => 'confirmed',
        ];
    }
}
