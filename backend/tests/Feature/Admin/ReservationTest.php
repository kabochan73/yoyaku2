<?php

namespace Tests\Feature\Admin;

use App\Models\Pricing;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->user = User::factory()->create();
        Pricing::create(['base_price' => 10000, 'extra_hour_price' => 5000]);
        Mail::fake();
    }

    public function test_管理者は全予約を取得できる(): void
    {
        Reservation::factory()->count(3)->create(['user_id' => $this->user->id]);

        $this->actingAs($this->admin)->getJson('/api/admin/reservations')
            ->assertOk()
            ->assertJsonCount(3);
    }

    public function test_一般ユーザーは管理者予約一覧にアクセスできない(): void
    {
        $this->actingAs($this->user)->getJson('/api/admin/reservations')
            ->assertStatus(403);
    }

    public function test_管理者は電話受付で予約を作成できる(): void
    {
        $start = Carbon::tomorrow()->setHour(10)->setMinute(0)->setSecond(0)->toDateTimeString();

        $this->actingAs($this->admin)->postJson('/api/admin/reservations', [
            'user_id' => $this->user->id,
            'start_datetime' => $start,
            'hours' => 2,
        ])->assertStatus(201)->assertJsonFragment(['total_price' => 10000]);
    }

    public function test_管理者は予約をキャンセルできる(): void
    {
        $reservation = Reservation::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'confirmed',
        ]);

        $this->actingAs($this->admin)
            ->patchJson("/api/admin/reservations/{$reservation->id}/cancel")
            ->assertOk()
            ->assertJsonFragment(['status' => 'cancelled']);
    }

    public function test_未認証は管理者APIにアクセスできない(): void
    {
        $this->getJson('/api/admin/reservations')->assertStatus(401);
    }
}
