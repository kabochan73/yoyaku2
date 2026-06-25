<?php

namespace Tests\Feature\Admin;

use App\Models\Pricing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingTest extends TestCase
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
    }

    public function test_料金を取得できる(): void
    {
        $this->actingAs($this->admin)->getJson('/api/admin/pricing')
            ->assertOk()
            ->assertJsonFragment(['base_price' => 10000, 'extra_hour_price' => 5000]);
    }

    public function test_料金を更新できる(): void
    {
        $this->actingAs($this->admin)->putJson('/api/admin/pricing', [
            'base_price' => 12000,
            'extra_hour_price' => 6000,
        ])->assertOk()->assertJsonFragment(['base_price' => 12000]);
    }

    public function test_一般ユーザーは料金を更新できない(): void
    {
        $this->actingAs($this->user)->putJson('/api/admin/pricing', [
            'base_price' => 12000,
            'extra_hour_price' => 6000,
        ])->assertStatus(403);
    }
}
