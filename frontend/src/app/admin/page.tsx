'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useAdminReservations } from '@/hooks/useAdminReservations'
import api from '@/lib/axios'
import type { User } from '@/types'

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']
const START_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatTime(datetime: string): string {
  return datetime.slice(11, 16)
}

export default function AdminReservationsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
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

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/')
  }, [user, router])

  if (!user || user.role !== 'admin') return null

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const openModal = (date: string) => {
    setForm({ user_id: users[0]?.id.toString() ?? '', hour: '10', hours: '2' })
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

  const weekLabel = `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日（月）〜${days[6].getMonth() + 1}月${days[6].getDate()}日（日）`

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 週ナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevWeek} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-100">
          &lt; 前の週
        </button>
        <span className="text-sm font-medium text-gray-700">{weekLabel}</span>
        <button onClick={nextWeek} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-100">
          次の週 &gt;
        </button>
      </div>

      {/* カレンダー */}
      {isLoading ? (
        <p className="text-gray-500 text-sm">読み込み中...</p>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const dateStr = toDateString(day)
            const dayReservations = reservations
              .filter(r => r.status === 'confirmed' && r.start_datetime.startsWith(dateStr))
              .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime))

            return (
              <div key={dateStr} className="border rounded-lg p-2 bg-white min-h-40">
                <p className={`text-xs font-semibold text-center mb-2 ${i >= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                  {DAY_LABELS[i]} {day.getMonth() + 1}/{day.getDate()}
                </p>

                {dayReservations.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center mb-2">予約なし</p>
                ) : (
                  <ul className="space-y-1 mb-2">
                    {dayReservations.map(r => (
                      <li key={r.id} className="bg-green-50 border border-green-200 rounded p-1.5 text-xs">
                        <p className="font-medium text-green-800 truncate">{r.user?.name}</p>
                        <p className="text-green-600">{formatTime(r.start_datetime)}〜{formatTime(r.end_datetime)}</p>
                        <button
                          onClick={() => {
                            if (confirm('予約をキャンセルしますか？')) cancel.mutate(r.id)
                          }}
                          className="text-red-500 hover:text-red-700 mt-0.5"
                        >
                          キャンセル
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => openModal(dateStr)}
                  className="w-full text-xs text-gray-500 hover:text-green-600 border border-dashed border-gray-300 rounded py-1"
                >
                  + 予約する
                </button>
              </div>
            )
          })}
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
