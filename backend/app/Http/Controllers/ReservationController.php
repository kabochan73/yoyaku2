<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use App\Models\Pricing;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reservations = $request->user()
            ->reservations()
            ->orderBy('start_datetime', 'desc')
            ->get();

        return response()->json($reservations);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'start_datetime' => ['required', 'date'],
            'hours' => ['required', 'integer', 'min:2', 'max:4'],
        ]);

        $start = Carbon::parse($data['start_datetime']);
        $end = $start->copy()->addHours($data['hours']);

        $this->validateBookingRules($start, $end);

        $pricing = Pricing::first();
        $totalPrice = $pricing->base_price + ($data['hours'] - 2) * $pricing->extra_hour_price;

        $reservation = $request->user()->reservations()->create([
            'start_datetime' => $start,
            'end_datetime' => $end,
            'hours' => $data['hours'],
            'total_price' => $totalPrice,
            'status' => 'confirmed',
        ]);

        return response()->json($reservation, 201);
    }

    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($reservation->status === 'cancelled') {
            return response()->json(['message' => 'すでにキャンセル済みです'], 422);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json($reservation);
    }

    private function validateBookingRules(Carbon $start, Carbon $end): void
    {
        // 営業時間チェック（10:00〜、最終受付20:00、終了22:00まで）
        if ($start->hour < 10 || $start->hour > 20) {
            abort(422, '予約開始は10:00〜20:00の間で指定してください');
        }
        if ($end->hour > 22 || ($end->hour === 22 && $end->minute > 0)) {
            abort(422, '終了時刻は22:00までです');
        }

        // 来月末まで
        $maxDate = Carbon::now()->endOfMonth()->addMonth();
        if ($start->gt($maxDate)) {
            abort(422, '予約は来月末までです');
        }

        // 過去日チェック
        if ($start->isPast()) {
            abort(422, '過去の日時は予約できません');
        }

        // 定休日チェック
        if (Holiday::where('date', $start->toDateString())->exists()) {
            abort(422, 'その日は定休日です');
        }

        // 重複チェック
        $overlap = Reservation::where('status', 'confirmed')
            ->where('start_datetime', '<', $end)
            ->where('end_datetime', '>', $start)
            ->exists();

        if ($overlap) {
            abort(422, 'その時間帯はすでに予約が入っています');
        }
    }
}
