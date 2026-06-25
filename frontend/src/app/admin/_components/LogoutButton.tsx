'use client'

import { useAuth } from '@/hooks/useAuth'

export const LogoutButton = () => {
  const { logout } = useAuth()

  return (
    <button
      onClick={() => logout.mutate()}
      className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded"
    >
      ログアウト
    </button>
  )
}
