'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore()
  const { isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role !== 'admin') router.push('/')
  }, [user, router, isLoading])

  if (isLoading || !user || user.role !== 'admin') return null

  return <>{children}</>
}
