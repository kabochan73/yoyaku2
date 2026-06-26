'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/axios'
import type { Holiday, WeeklyHoliday } from '@/types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function AdminHolidaysPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/')
  }, [user, router])

  // 特定日付の定休日
  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['admin', 'holidays'],
    queryFn: async () => {
      const res = await api.get<Holiday[]>('/api/admin/holidays')
      return res.data
    },
  })

  const addHoliday = useMutation({
    mutationFn: (date: string) => api.post<Holiday>('/api/admin/holidays', { date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'holidays'] })
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      setDate('')
    },
  })

  const removeHoliday = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/holidays/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'holidays'] })
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
    },
  })

  // 週次定休日
  const { data: weeklyHolidays = [] } = useQuery({
    queryKey: ['admin', 'weekly-holidays'],
    queryFn: async () => {
      const res = await api.get<WeeklyHoliday[]>('/api/admin/weekly-holidays')
      return res.data
    },
  })

  const addWeeklyHoliday = useMutation({
    mutationFn: (day_of_week: number) =>
      api.post<WeeklyHoliday>('/api/admin/weekly-holidays', { day_of_week }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'weekly-holidays'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-holidays'] })
    },
  })

  const removeWeeklyHoliday = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/weekly-holidays/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'weekly-holidays'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-holidays'] })
    },
  })

  if (!user || user.role !== 'admin') return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    addHoliday.mutate(date)
  }

  const toggleWeeklyHoliday = (dayOfWeek: number) => {
    const existing = weeklyHolidays.find((wh) => wh.day_of_week === dayOfWeek)
    if (existing) {
      removeWeeklyHoliday.mutate(existing.id)
    } else {
      addWeeklyHoliday.mutate(dayOfWeek)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-10">

      {/* 週次定休日 */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-1">定休日（曜日）</h2>
        <p className="text-xs text-gray-500 mb-4">毎週繰り返す定休日を設定します</p>
        <div className="flex gap-2 flex-wrap">
          {WEEKDAYS.map((label, i) => {
            const isSet = weeklyHolidays.some((wh) => wh.day_of_week === i)
            return (
              <button
                key={i}
                onClick={() => toggleWeeklyHoliday(i)}
                className={`w-12 h-12 rounded-full text-sm font-medium transition-colors ${
                  isSet
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {/* 特定日付の休日 */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-1">臨時休日（日付）</h2>
        <p className="text-xs text-gray-500 mb-4">祝日など特定の日を休みにします</p>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={addHoliday.isPending || !date}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          >
            追加
          </button>
        </form>

        {addHoliday.isError && (
          <p className="text-red-500 text-sm mb-4">その日付はすでに登録されています</p>
        )}

        {isLoading ? (
          <p className="text-gray-500 text-sm">読み込み中...</p>
        ) : holidays.length === 0 ? (
          <p className="text-gray-400 text-sm">臨時休日は登録されていません</p>
        ) : (
          <ul className="space-y-2">
            {holidays.map(h => (
              <li key={h.id} className="flex items-center justify-between border rounded-lg px-4 py-2.5 bg-white">
                <span className="text-sm text-gray-800">{h.date}</span>
                <button
                  onClick={() => removeHoliday.mutate(h.id)}
                  disabled={removeHoliday.isPending}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  )
}
