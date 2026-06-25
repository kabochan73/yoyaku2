'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Holiday } from '@/types'

type BookedSlot = {
  start_datetime: string
  end_datetime: string
}

export const useCalendar = (from: string, to: string) => {
  const { data: bookedSlots = [] } = useQuery({
    queryKey: ['availability', from, to],
    queryFn: async () => {
      const res = await api.get<BookedSlot[]>('/api/availability', {
        params: { from, to },
      })
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

  const isHoliday = (dateStr: string) =>
    holidays.some((h) => h.date === dateStr)

  const isPast = (dateStr: string, hour: number) => {
    const slot = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`)
    return slot <= new Date()
  }

  const isBooked = (dateStr: string, hour: number) => {
    const slotStart = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(slotEnd.getHours() + 1)

    return bookedSlots.some((b) => {
      const bStart = new Date(b.start_datetime)
      const bEnd = new Date(b.end_datetime)
      return bStart < slotEnd && bEnd > slotStart
    })
  }

  const isAvailable = (dateStr: string, hour: number) =>
    !isPast(dateStr, hour) && !isHoliday(dateStr) && !isBooked(dateStr, hour)

  return { isAvailable, isHoliday, isPast }
}
