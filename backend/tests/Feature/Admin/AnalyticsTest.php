<?php

namespace Tests\Feature\Admin;

use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->user = User::factory()->create();
    }

    public function test_売上分析を取得できる(): void
    {
        Reservation::factory()->create([
            'user_id' => $this->user->id,
            'start_datetime' => Carbon::create(2026, 7, 1, 10),
            'end_datetime' => Carbon::create(2026, 7, 1, 12),
            'hours' => 2,
            'total_price' => 10000,
            'status' => 'confirmed',
        ]);

        $this->actingAs($this->admin)->getJson('/api/admin/analytics?year=2026&month=7')
            ->assertOk()
            ->assertJsonFragment([
                'year' => 2026,
                'month' => 7,
            ])
            ->assertJsonPath('summary.total_price', 10000)
            ->assertJsonPath('summary.count', 1);
    }

    public function test_キャンセル済みは売上に含まれない(): void
    {
        Reservation::factory()->create([
            'user_id' => $this->user->id,
            'start_datetime' => Carbon::create(2026, 7, 1, 10),
            'end_datetime' => Carbon::create(2026, 7, 1, 12),
            'hours' => 2,
            'total_price' => 10000,
            'status' => 'cancelled',
        ]);

        $this->actingAs($this->admin)->getJson('/api/admin/analytics?year=2026&month=7')
            ->assertOk()
            ->assertJsonPath('summary.total_price', 0)
            ->assertJsonPath('summary.count', 0);
    }

    public function test_一般ユーザーは売上分析にアクセスできない(): void
    {
        $this->actingAs($this->user)->getJson('/api/admin/analytics')
            ->assertStatus(403);
    }
}
