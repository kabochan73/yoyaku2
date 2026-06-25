'use client'

import { useReservations } from '@/hooks/useReservations'

export const ReservationList = () => {
  const { reservations, isLoading, cancel } = useReservations()

  if (isLoading) return <p className="text-gray-500 text-sm">読み込み中...</p>

  const upcoming = reservations.filter((r) => r.status === 'confirmed')
  const past = reservations.filter((r) => r.status === 'cancelled')

  const formatDate = (datetime: string) =>
    new Date(datetime).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-6">
      {/* 予約中 */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">予約中</h3>
        {upcoming.length === 0 ? (
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

      {/* キャンセル済み */}
      {past.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-400 mb-3 text-sm">キャンセル済み</h3>
          <ul className="space-y-2">
            {past.map((r) => (
              <li key={r.id} className="border rounded-lg p-4 text-sm text-gray-400">
                <p>{formatDate(r.start_datetime)} 〜 {formatDate(r.end_datetime)}</p>
                <p>{r.hours}時間 / ¥{r.total_price.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
