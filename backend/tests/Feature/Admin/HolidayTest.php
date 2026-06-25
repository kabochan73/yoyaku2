<?php

namespace Tests\Feature\Admin;

use App\Models\Holiday;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HolidayTest extends TestCase
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

    public function test_定休日一覧を取得できる(): void
    {
        Holiday::create(['date' => '2026-08-01']);
        Holiday::create(['date' => '2026-08-15']);

        $this->actingAs($this->admin)->getJson('/api/admin/holidays')
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_定休日を登録できる(): void
    {
        $this->actingAs($this->admin)->postJson('/api/admin/holidays', [
            'date' => '2026-08-01',
        ])->assertStatus(201)->assertJsonFragment(['date' => '2026-08-01']);
    }

    public function test_同じ日付は重複登録できない(): void
    {
        Holiday::create(['date' => '2026-08-01']);

        $this->actingAs($this->admin)->postJson('/api/admin/holidays', [
            'date' => '2026-08-01',
        ])->assertStatus(422);
    }

    public function test_定休日を削除できる(): void
    {
        $holiday = Holiday::create(['date' => '2026-08-01']);

        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/holidays/{$holiday->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('holidays', ['date' => '2026-08-01']);
    }

    public function test_一般ユーザーは定休日を登録できない(): void
    {
        $this->actingAs($this->user)->postJson('/api/admin/holidays', [
            'date' => '2026-08-01',
        ])->assertStatus(403);
    }
}
