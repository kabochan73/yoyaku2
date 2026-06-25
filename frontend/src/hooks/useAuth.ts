'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'
import type { LoginInput, RegisterInput } from '@/lib/zod/schemas'
import type { User } from '@/types'

export const useAuth = () => {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  // ログインユーザー取得（マウント時に認証状態を復元）
  const { isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<User>('/api/me')
      setUser(res.data)
      return res.data
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  })

  // 登録
  const register = useMutation({
    mutationFn: async (data: RegisterInput) => {
      await api.get('/sanctum/csrf-cookie')
      return api.post<User>('/api/register', data)
    },
    onSuccess: (res) => {
      setUser(res.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/')
    },
  })

  // ログイン
  const login = useMutation({
    mutationFn: async (data: LoginInput) => {
      await api.get('/sanctum/csrf-cookie')
      return api.post<User>('/api/login', data)
    },
    onSuccess: (res) => {
      setUser(res.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/')
    },
  })

  // ログアウト
  const logout = useMutation({
    mutationFn: () => api.post('/api/logout'),
    onSuccess: () => {
      setUser(null)
      queryClient.clear()
      router.push('/login')
    },
  })

  return {
    user,
    isLoading,
    register,
    login,
    logout,
  }
}
