'use client'

import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'

export const Header = () => {
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-green-600">
          フットサルコート
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name}</span>
              <Link
                href="/mypage"
                className="text-sm text-gray-700 hover:text-green-600"
              >
                マイページ
              </Link>
              <button
                onClick={() => logout.mutate()}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-700 hover:text-green-600"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
