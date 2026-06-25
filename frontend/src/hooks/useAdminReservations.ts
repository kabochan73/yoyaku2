'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Reservation } from '@/types'

type AdminReservationInput = {
  user_id: number
  start_datetime: string
  hours: number
}

export const useAdminReservations = () => {
  const queryClient = useQueryClient()

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: async () => {
      const res = await api.get<Reservation[]>('/api/admin/reservations')
      return res.data
    },
  })

  const create = useMutation({
    mutationFn: (data: AdminReservationInput) =>
      api.post<Reservation>('/api/admin/reservations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })

  const cancel = useMutation({
    mutationFn: (id: number) =>
      api.patch<Reservation>(`/api/admin/reservations/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })

  return { reservations, isLoading, create, cancel }
}
