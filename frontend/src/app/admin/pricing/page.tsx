'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/axios'
import type { Pricing } from '@/types'

export default function AdminPricingPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ base_price: '', extra_hour_price: '' })

  const { data: pricing, isLoading } = useQuery({
    queryKey: ['admin', 'pricing'],
    queryFn: async () => {
      const res = await api.get<Pricing>('/api/admin/pricing')
      return res.data
    },
  })

  const update = useMutation({
    mutationFn: (data: { base_price: number; extra_hour_price: number }) =>
      api.put<Pricing>('/api/admin/pricing', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pricing'] })
    },
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/')
  }, [user, router])

  useEffect(() => {
    if (pricing) {
      setForm({
        base_price: pricing.base_price.toString(),
        extra_hour_price: pricing.extra_hour_price.toString(),
      })
    }
  }, [pricing])

  if (!user || user.role !== 'admin') return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update.mutate({
      base_price: Number(form.base_price),
      extra_hour_price: Number(form.extra_hour_price),
    })
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">料金設定</h1>

      {isLoading ? (
        <p className="text-gray-500 text-sm">読み込み中...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              基本料金（2時間）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.base_price}
                onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                min={0}
              />
              <span className="text-sm text-gray-500 shrink-0">円</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              延長料金（1時間あたり）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.extra_hour_price}
                onChange={e => setForm(f => ({ ...f, extra_hour_price: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                min={0}
              />
              <span className="text-sm text-gray-500 shrink-0">円</span>
            </div>
          </div>

          {update.isSuccess && (
            <p className="text-green-600 text-sm">料金を更新しました</p>
          )}
          {update.isError && (
            <p className="text-red-500 text-sm">更新に失敗しました</p>
          )}

          <button
            type="submit"
            disabled={update.isPending}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2 text-sm disabled:opacity-50"
          >
            {update.isPending ? '更新中...' : '更新する'}
          </button>
        </form>
      )}
    </div>
  )
}
