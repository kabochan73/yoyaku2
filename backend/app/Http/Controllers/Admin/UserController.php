<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::where('role', 'user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }
}
