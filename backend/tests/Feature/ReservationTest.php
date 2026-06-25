<?php

namespace Tests\Feature;

use App\Models\Holiday;
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

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Pricing::create(['base_price' => 10000, 'extra_hour_price' => 5000]);
        Mail::fake();
    }

    private function futureStart(int $hour = 10): string
    {
        return Carbon::tomorrow()->setHour($hour)->setMinute(0)->setSecond(0)->toDateTimeString();
    }

    public function test_予約を作成できる(): void
    {
        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(10),
            'hours' => 2,
        ])->assertStatus(201)->assertJsonFragment([
            'hours' => 2,
            'total_price' => 10000,
            'status' => 'confirmed',
        ]);
    }

    public function test_3時間予約の料金が正しい(): void
    {
        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(10),
            'hours' => 3,
        ])->assertStatus(201)->assertJsonFragment(['total_price' => 15000]);
    }

    public function test_4時間予約の料金が正しい(): void
    {
        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(10),
            'hours' => 4,
        ])->assertStatus(201)->assertJsonFragment(['total_price' => 20000]);
    }

    public function test_2時間未満は予約できない(): void
    {
        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(10),
            'hours' => 1,
        ])->assertStatus(422);
    }

    public function test_4時間超は予約できない(): void
    {
        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(10),
            'hours' => 5,
        ])->assertStatus(422);
    }

    public function test_営業時間外は予約できない(): void
    {
        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(21),
            'hours' => 2,
        ])->assertStatus(422);
    }

    public function test_終了が22時を超える予約はできない(): void
    {
        // 21時開始2時間 → 23時終了
        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(21),
            'hours' => 2,
        ])->assertStatus(422);
    }

    public function test_過去日時は予約できない(): void
    {
        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => Carbon::yesterday()->setHour(10)->toDateTimeString(),
            'hours' => 2,
        ])->assertStatus(422);
    }

    public function test_定休日は予約できない(): void
    {
        Holiday::create(['date' => Carbon::tomorrow()->toDateString()]);

        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(10),
            'hours' => 2,
        ])->assertStatus(422);
    }

    public function test_時間帯が重複する予約はできない(): void
    {
        Reservation::factory()->create([
            'user_id' => $this->user->id,
            'start_datetime' => $this->futureStart(10),
            'end_datetime' => $this->futureStart(12),
            'hours' => 2,
            'total_price' => 10000,
            'status' => 'confirmed',
        ]);

        $this->actingAs($this->user)->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(11),
            'hours' => 2,
        ])->assertStatus(422);
    }

    public function test_予約一覧を取得できる(): void
    {
        Reservation::factory()->count(2)->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)->getJson('/api/reservations')
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_自分の予約のみ取得できる(): void
    {
        $other = User::factory()->create();
        Reservation::factory()->create(['user_id' => $this->user->id]);
        Reservation::factory()->create(['user_id' => $other->id]);

        $this->actingAs($this->user)->getJson('/api/reservations')
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_予約をキャンセルできる(): void
    {
        $reservation = Reservation::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'confirmed',
        ]);

        $this->actingAs($this->user)
            ->patchJson("/api/reservations/{$reservation->id}/cancel")
            ->assertOk()
            ->assertJsonFragment(['status' => 'cancelled']);
    }

    public function test_他人の予約はキャンセルできない(): void
    {
        $other = User::factory()->create();
        $reservation = Reservation::factory()->create([
            'user_id' => $other->id,
            'status' => 'confirmed',
        ]);

        $this->actingAs($this->user)
            ->patchJson("/api/reservations/{$reservation->id}/cancel")
            ->assertStatus(403);
    }

    public function test_未認証は予約できない(): void
    {
        $this->postJson('/api/reservations', [
            'start_datetime' => $this->futureStart(10),
            'hours' => 2,
        ])->assertStatus(401);
    }
}
