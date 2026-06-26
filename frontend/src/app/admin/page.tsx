'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAdminReservations } from '@/hooks/useAdminReservations'
import api from '@/lib/axios'
import type { User, Holiday, WeeklyHoliday, Reservation } from '@/types'

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
const START_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

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

export default function AdminReservationsPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [modal, setModal] = useState<{ date: string } | null>(null)
  const [form, setForm] = useState({ user_id: '', hour: '10', hours: '2' })

  const { reservations, isLoading, create, cancel } = useAdminReservations()

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await api.get<User[]>('/api/admin/users')
      return res.data
    },
  })

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const res = await api.get<Holiday[]>('/api/holidays')
      return res.data
    },
  })

  const { data: weeklyHolidays = [] } = useQuery({
    queryKey: ['weekly-holidays'],
    queryFn: async () => {
      const res = await api.get<WeeklyHoliday[]>('/api/weekly-holidays')
      return res.data
    },
  })

  const weekStart = getWeekStart(weekOffset)
  const weekEnd = addDays(weekStart, 6)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const from = toDateStr(weekStart)
  const to = toDateStr(weekEnd)

  const isHoliday = (dateStr: string) => {
    if (holidays.some((h) => h.date === dateStr)) return true
    const dayOfWeek = new Date(dateStr).getDay()
    return weeklyHolidays.some((wh) => wh.day_of_week === dayOfWeek)
  }

  const isPast = (dateStr: string, hour: number) => {
    const slot = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`)
    return slot <= new Date()
  }

  const getReservationForSlot = (dateStr: string, hour: number): Reservation | undefined => {
    const slotStart = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(slotEnd.getHours() + 1)

    return reservations.find(r => {
      if (r.status !== 'confirmed') return false
      const rStart = new Date(r.start_datetime.replace('Z', ''))
      const rEnd = new Date(r.end_datetime.replace('Z', ''))
      return rStart < slotEnd && rEnd > slotStart
    })
  }

  const openModal = (date: string, hour: number) => {
    setForm({ user_id: users[0]?.id.toString() ?? '', hour: String(hour), hours: '2' })
    setModal({ date })
  }

  const handleCreate = () => {
    if (!modal) return
    const start = `${modal.date}T${String(form.hour).padStart(2, '0')}:00:00`
    create.mutate(
      { user_id: Number(form.user_id), start_datetime: start, hours: Number(form.hours) },
      { onSuccess: () => setModal(null) }
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 週ナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
        >
          ← 前週
        </button>
        <span className="text-sm text-gray-600">{from} 〜 {to}</span>
        <button
          onClick={() => setWeekOffset(o => o + 1)}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
        >
          次週 →
        </button>
      </div>

      {/* カレンダーテーブル */}
      {isLoading ? (
        <p className="text-gray-500 text-sm">読み込み中...</p>
      ) : (
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
                    const reservation = getReservationForSlot(dateStr, hour)

                    if (past || holiday) {
                      return (
                        <td key={dateStr} className="border p-1 text-center bg-gray-100">
                          {reservation ? (
                            <span className="text-xs text-gray-400 truncate block">{reservation.user?.name}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      )
                    }

                    if (reservation) {
                      return (
                        <td key={dateStr} className="border p-1 text-center bg-green-50">
                          <p className="text-xs font-medium text-green-800 truncate">{reservation.user?.name}</p>
                          <button
                            onClick={() => {
                              if (confirm('予約をキャンセルしますか？')) cancel.mutate(reservation.id)
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            キャンセル
                          </button>
                        </td>
                      )
                    }

                    return (
                      <td
                        key={dateStr}
                        onClick={() => openModal(dateStr, hour)}
                        className="border p-2 text-center text-gray-300 cursor-pointer hover:bg-green-50 hover:text-green-600 transition-colors"
                      >
                        +
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 予約追加モーダル */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">予約を追加</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                <p className="text-sm text-gray-800">{modal.date}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー</label>
                <select
                  value={form.user_id}
                  onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}（{u.email}）</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                <select
                  value={form.hour}
                  onChange={e => setForm(f => ({ ...f, hour: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {START_HOURS.map(h => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">時間数</label>
                <select
                  value={form.hours}
                  onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="2">2時間</option>
                  <option value="3">3時間</option>
                  <option value="4">4時間</option>
                </select>
              </div>
            </div>

            {create.isError && (
              <p className="text-red-500 text-sm mt-3">その時間帯はすでに予約が入っています</p>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50"
              >
                閉じる
              </button>
              <button
                onClick={handleCreate}
                disabled={create.isPending || !form.user_id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm disabled:opacity-50"
              >
                {create.isPending ? '追加中...' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
