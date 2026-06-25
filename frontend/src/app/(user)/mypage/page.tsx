'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { ReservationList } from './_components/ReservationList'
import { ProfileForm } from './_components/ProfileForm'

export default function MyPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold text-gray-800">マイページ</h1>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
          予約一覧
        </h2>
        <ReservationList />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
          プロフィール変更
        </h2>
        <ProfileForm />
      </section>
    </div>
  )
}
