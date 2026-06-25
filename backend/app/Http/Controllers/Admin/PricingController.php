<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pricing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(Pricing::first());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'base_price' => ['required', 'integer', 'min:0'],
            'extra_hour_price' => ['required', 'integer', 'min:0'],
        ]);

        $pricing = Pricing::firstOrCreate([]);
        $pricing->update($data);

        return response()->json($pricing);
    }
}
