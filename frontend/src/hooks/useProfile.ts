'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'
import type { ProfileInput } from '@/lib/zod/schemas'
import type { User } from '@/types'

export const useProfile = () => {
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()

  const update = useMutation({
    mutationFn: (data: ProfileInput) => api.put<User>('/api/profile', data),
    onSuccess: (res) => {
      setUser(res.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  return { update }
}
