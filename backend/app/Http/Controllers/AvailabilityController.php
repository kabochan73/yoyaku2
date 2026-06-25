<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date'],
        ]);

        $reservations = Reservation::where('status', 'confirmed')
            ->where('start_datetime', '>=', $data['from'])
            ->where('end_datetime', '<=', $data['to'] . ' 23:59:59')
            ->get(['start_datetime', 'end_datetime']);

        return response()->json($reservations);
    }
}
