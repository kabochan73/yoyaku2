<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\Pricing;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reservations = Reservation::with('user')
            ->orderBy('start_datetime', 'desc')
            ->get();

        return response()->json($reservations);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'start_datetime' => ['required', 'date'],
            'hours' => ['required', 'integer', 'min:2', 'max:4'],
        ]);

        $start = Carbon::parse($data['start_datetime']);
        $end = $start->copy()->addHours($data['hours']);

        // 重複チェック
        $overlap = Reservation::where('status', 'confirmed')
            ->where('start_datetime', '<', $end)
            ->where('end_datetime', '>', $start)
            ->exists();

        if ($overlap) {
            return response()->json(['message' => 'その時間帯はすでに予約が入っています'], 422);
        }

        $pricing = Pricing::first();
        $totalPrice = $pricing->base_price + ($data['hours'] - 2) * $pricing->extra_hour_price;

        $reservation = Reservation::create([
            'user_id' => $data['user_id'],
            'start_datetime' => $start,
            'end_datetime' => $end,
            'hours' => $data['hours'],
            'total_price' => $totalPrice,
            'status' => 'confirmed',
        ]);

        return response()->json($reservation->load('user'), 201);
    }

    public function cancel(Reservation $reservation): JsonResponse
    {
        if ($reservation->status === 'cancelled') {
            return response()->json(['message' => 'すでにキャンセル済みです'], 422);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json($reservation);
    }
}
