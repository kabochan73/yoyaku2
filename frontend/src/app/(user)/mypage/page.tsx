'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useReservations } from '@/hooks/useReservations'

export default function MyPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const { reservations, isLoading, cancel } = useReservations()

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  if (!user) return null

  const formatDate = (datetime: string) =>
    new Date(datetime).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const upcoming = reservations.filter((r) => r.status === 'confirmed')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">予約一覧</h1>

      {isLoading ? (
        <p className="text-gray-500 text-sm">読み込み中...</p>
      ) : upcoming.length === 0 ? (
        <p className="text-gray-400 text-sm">予約はありません</p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((r) => (
            <li key={r.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{formatDate(r.start_datetime)} 〜 {formatDate(r.end_datetime)}</p>
                <p className="text-gray-500">{r.hours}時間 / ¥{r.total_price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('予約をキャンセルしますか？')) {
                    cancel.mutate(r.id)
                  }
                }}
                disabled={cancel.isPending}
                className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                キャンセル
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
