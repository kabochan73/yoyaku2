'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useCalendar } from '@/hooks/useCalendar'
import { ReserveModal } from './ReserveModal'

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

const toDateStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const addDays = (date: Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const getWeekStart = (offset: number) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return addDays(today, offset * 7)
}

export const WeeklyCalendar = () => {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string
    hour: number
  } | null>(null)

  const { user } = useAuthStore()
  const router = useRouter()

  const weekStart = getWeekStart(weekOffset)
  const weekEnd = addDays(weekStart, 6)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const from = toDateStr(weekStart)
  const to = toDateStr(weekEnd)

  const { isAvailable, isHoliday, isPast } = useCalendar(from, to)

  // 来月末を超えたら次週に進めない
  const nextMonthEnd = new Date()
  nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 2, 0)
  const canGoNext = weekEnd < nextMonthEnd

  const handleSlotClick = (dateStr: string, hour: number) => {
    if (!isAvailable(dateStr, hour)) return
    if (!user) {
      router.push('/login')
      return
    }
    setSelectedSlot({ date: dateStr, hour })
  }

  return (
    <div>
      {/* ナビゲーション */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          disabled={weekOffset === 0}
          className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
        >
          ← 前週
        </button>
        <span className="text-sm text-gray-600">
          {from} 〜 {to}
        </span>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          disabled={!canGoNext}
          className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
        >
          次週 →
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-50 w-16" />
              {days.map((day) => {
                const dateStr = toDateStr(day)
                const dayOfWeek = day.getDay()
                const holiday = isHoliday(dateStr)
                return (
                  <th
                    key={dateStr}
                    className={`border p-2 text-center ${
                      holiday ? 'bg-red-50 text-red-400' :
                      dayOfWeek === 0 ? 'text-red-500' :
                      dayOfWeek === 6 ? 'text-blue-500' : 'bg-gray-50'
                    }`}
                  >
                    <div>{`${day.getMonth() + 1}/${day.getDate()}`}</div>
                    <div className="text-xs">{WEEKDAYS[dayOfWeek]}</div>
                    {holiday && <div className="text-xs">定休日</div>}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="border p-2 text-center text-gray-500 text-xs bg-gray-50">
                  {hour}:00
                </td>
                {days.map((day) => {
                  const dateStr = toDateStr(day)
                  const past = isPast(dateStr, hour)
                  const holiday = isHoliday(dateStr)
                  const available = isAvailable(dateStr, hour)

                  return (
                    <td
                      key={dateStr}
                      onClick={() => handleSlotClick(dateStr, hour)}
                      className={`border p-2 text-center text-base transition-colors ${
                        past || holiday
                          ? 'bg-gray-100 text-gray-300 cursor-default'
                          : available
                          ? 'cursor-pointer hover:bg-green-50'
                          : 'cursor-default'
                      }`}
                    >
                      {past || holiday ? '—' : available ? '〇' : '❌'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!user && (
        <p className="text-center text-sm text-gray-500 mt-3">
          予約するには
          <button
            onClick={() => router.push('/login')}
            className="text-green-600 underline mx-1"
          >
            ログイン
          </button>
          してください
        </p>
      )}

      {selectedSlot && (
        <ReserveModal
          date={selectedSlot.date}
          hour={selectedSlot.hour}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  )
}
