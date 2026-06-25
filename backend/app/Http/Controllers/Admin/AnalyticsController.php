<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $year = $request->integer('year', now()->year);
        $month = $request->integer('month', now()->month);

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $reservations = Reservation::where('status', 'confirmed')
            ->whereBetween('start_datetime', [$start, $end])
            ->get();

        // 月別集計
        $monthlySummary = [
            'total_price' => $reservations->sum('total_price'),
            'count' => $reservations->count(),
        ];

        // 曜日別（0=日曜〜6=土曜）
        $byDayOfWeek = $reservations->groupBy(fn ($r) => Carbon::parse($r->start_datetime)->dayOfWeek)
            ->map(fn ($group) => [
                'count' => $group->count(),
                'total_price' => $group->sum('total_price'),
            ]);

        // 時間帯別
        $byHour = $reservations->groupBy(fn ($r) => Carbon::parse($r->start_datetime)->hour)
            ->map(fn ($group) => [
                'count' => $group->count(),
                'total_price' => $group->sum('total_price'),
            ]);

        return response()->json([
            'year' => $year,
            'month' => $month,
            'summary' => $monthlySummary,
            'by_day_of_week' => $byDayOfWeek,
            'by_hour' => $byHour,
        ]);
    }
}
