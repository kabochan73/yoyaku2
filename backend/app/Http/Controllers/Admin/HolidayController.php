<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Holiday::orderBy('date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date', 'unique:holidays'],
        ]);

        $holiday = Holiday::create($data);

        return response()->json($holiday, 201);
    }

    public function destroy(Holiday $holiday): JsonResponse
    {
        $holiday->delete();

        return response()->json(null, 204);
    }
}
