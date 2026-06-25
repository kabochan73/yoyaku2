'use client'

import { useState } from 'react'
import { useReservations } from '@/hooks/useReservations'

type Props = {
  date: string
  hour: number
  onClose: () => void
}

export const ReserveModal = ({ date, hour, onClose }: Props) => {
  const [hours, setHours] = useState(2)
  const { create } = useReservations()

  const startDatetime = `${date}T${String(hour).padStart(2, '0')}:00:00`
  const endHour = hour + hours
  const totalPrice = 10000 + (hours - 2) * 5000

  const handleSubmit = () => {
    create.mutate(
      { start_datetime: startDatetime, hours },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-bold text-gray-800 mb-4">予約確認</h2>

        <dl className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <dt className="text-gray-500">日付</dt>
            <dd className="font-medium">{date}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">開始時間</dt>
            <dd className="font-medium">{hour}:00</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-gray-500">利用時間</dt>
            <dd>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[2, 3, 4].map((h) => (
                  // 終了が22時を超えるオプションは非表示
                  hour + h <= 22 && (
                    <option key={h} value={h}>
                      {h}時間
                    </option>
                  )
                ))}
              </select>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">終了時間</dt>
            <dd className="font-medium">{endHour}:00</dd>
          </div>
          <div className="flex justify-between border-t pt-2">
            <dt className="font-semibold">料金</dt>
            <dd className="font-bold text-green-600">
              ¥{totalPrice.toLocaleString()}
            </dd>
          </div>
        </dl>

        {create.isError && (
          <p className="text-red-500 text-sm mb-3">
            予約に失敗しました。時間帯を確認してください。
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={create.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm disabled:opacity-50"
          >
            {create.isPending ? '処理中...' : '予約する'}
          </button>
        </div>
      </div>
    </div>
  )
}
