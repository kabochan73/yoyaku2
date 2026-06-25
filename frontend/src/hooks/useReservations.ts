'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ReservationInput } from '@/lib/zod/schemas'
import type { Reservation } from '@/types'

export const useReservations = () => {
  const queryClient = useQueryClient()

  // 自分の予約一覧
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const res = await api.get<Reservation[]>('/api/reservations')
      return res.data
    },
  })

  // 予約作成
  const create = useMutation({
    mutationFn: (data: ReservationInput) =>
      api.post<Reservation>('/api/reservations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })

  // キャンセル
  const cancel = useMutation({
    mutationFn: (id: number) =>
      api.patch<Reservation>(`/api/reservations/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })

  return {
    reservations,
    isLoading,
    create,
    cancel,
  }
}
