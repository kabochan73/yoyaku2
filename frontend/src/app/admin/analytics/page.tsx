'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/axios'

type AnalyticsData = {
  year: number
  month: number
  summary: { total_price: number; count: number }
  by_day_of_week: Record<string, { count: number; total_price: number }>
  by_hour: Record<string, { count: number; total_price: number }>
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export default function AdminAnalyticsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/')
  }, [user, router])

  // 選択月のデータ
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', year, month],
    queryFn: async () => {
      const res = await api.get<AnalyticsData>('/api/admin/analytics', { params: { year, month } })
      return res.data
    },
  })

  // 年間データ（12ヶ月並列取得）
  const { data: yearlyData, isLoading: isYearlyLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'yearly', year],
    queryFn: async () => {
      const results = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          api.get<AnalyticsData>('/api/admin/analytics', { params: { year, month: i + 1 } })
        )
      )
      return results.map(r => r.data)
    },
  })

  if (!user || user.role !== 'admin') return null

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const maxDayCount = data
    ? Math.max(...DAY_LABELS.map((_, i) => data.by_day_of_week[i]?.count ?? 0), 1)
    : 1
  const maxHourCount = data
    ? Math.max(...HOURS.map(h => data.by_hour[h]?.count ?? 0), 1)
    : 1

  const maxMonthlyPrice = yearlyData
    ? Math.max(...yearlyData.map(d => d.summary.total_price), 1)
    : 1
  const maxMonthlyCount = yearlyData
    ? Math.max(...yearlyData.map(d => d.summary.count), 1)
    : 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* 年間推移 */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setYear(y => y - 1)} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-100">&lt;</button>
          <span className="text-lg font-bold text-gray-800">{year}年</span>
          <button onClick={() => setYear(y => y + 1)} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-100">&gt;</button>
        </div>

        {isYearlyLoading ? (
          <p className="text-gray-500 text-sm">読み込み中...</p>
        ) : yearlyData && (
          <div className="grid grid-cols-2 gap-4">
            {/* 月別売上 */}
            <div className="bg-white border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">月別売上</h2>
              <div className="space-y-1.5">
                {yearlyData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-8">{MONTH_LABELS[i]}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all"
                        style={{ width: `${(d.summary.total_price / maxMonthlyPrice) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-16 text-right">
                      ¥{d.summary.total_price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 月別予約数 */}
            <div className="bg-white border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">月別予約数</h2>
              <div className="space-y-1.5">
                {yearlyData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-8">{MONTH_LABELS[i]}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all"
                        style={{ width: `${(d.summary.count / maxMonthlyCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">{d.summary.count}件</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 月別詳細 */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-100">&lt;</button>
          <span className="text-lg font-bold text-gray-800">{year}年{month}月の詳細</span>
          <button onClick={nextMonth} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-100">&gt;</button>
        </div>

        {isLoading ? (
          <p className="text-gray-500 text-sm">読み込み中...</p>
        ) : data && (
          <>
            {/* サマリー */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border rounded-xl p-5">
                <p className="text-xs text-gray-500 mb-1">月間売上</p>
                <p className="text-2xl font-bold text-gray-800">
                  ¥{data.summary.total_price.toLocaleString()}
                </p>
              </div>
              <div className="bg-white border rounded-xl p-5">
                <p className="text-xs text-gray-500 mb-1">予約数</p>
                <p className="text-2xl font-bold text-gray-800">
                  {data.summary.count}<span className="text-base font-normal text-gray-500 ml-1">件</span>
                </p>
              </div>
            </div>

            {/* 曜日別 */}
            <div className="bg-white border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">曜日別予約数</h2>
              <div className="space-y-2">
                {DAY_LABELS.map((label, i) => {
                  const count = data.by_day_of_week[i]?.count ?? 0
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-xs w-4 text-center font-medium ${i === 0 || i === 6 ? 'text-red-500' : 'text-gray-600'}`}>
                        {label}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all"
                          style={{ width: `${(count / maxDayCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8 text-right">{count}件</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 時間帯別 */}
            <div className="bg-white border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">時間帯別予約数</h2>
              <div className="space-y-2">
                {HOURS.map(h => {
                  const count = data.by_hour[h]?.count ?? 0
                  return (
                    <div key={h} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-10 text-right">{h}:00</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all"
                          style={{ width: `${(count / maxHourCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8 text-right">{count}件</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
