<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WeeklyHoliday;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeeklyHolidayController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(WeeklyHoliday::orderBy('day_of_week')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'day_of_week' => ['required', 'integer', 'min:0', 'max:6', 'unique:weekly_holidays'],
        ]);

        return response()->json(WeeklyHoliday::create($data), 201);
    }

    public function destroy(WeeklyHoliday $weeklyHoliday): JsonResponse
    {
        $weeklyHoliday->delete();

        return response()->json(null, 204);
    }
}
