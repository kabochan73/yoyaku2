<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_名前を更新できる(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/profile', ['name' => '新しい名前'])
            ->assertOk()
            ->assertJsonFragment(['name' => '新しい名前']);
    }

    public function test_メールアドレスを更新できる(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/profile', ['email' => 'new@example.com'])
            ->assertOk()
            ->assertJsonFragment(['email' => 'new@example.com']);
    }

    public function test_他ユーザーのメールに変更できない(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/profile', ['email' => 'taken@example.com'])
            ->assertStatus(422);
    }

    public function test_パスワードを更新できる(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/profile', [
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ])->assertOk();
    }

    public function test_未認証はプロフィール更新できない(): void
    {
        $this->putJson('/api/profile', ['name' => 'test'])->assertStatus(401);
    }
}
