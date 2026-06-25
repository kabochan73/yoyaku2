'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/stores/authStore'
import { useProfile } from '@/hooks/useProfile'
import { profileSchema, type ProfileInput } from '@/lib/zod/schemas'

export const ProfileForm = () => {
  const { user } = useAuthStore()
  const { update } = useProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name, email: user?.email },
  })

  const onSubmit = (data: ProfileInput) => {
    // 空のパスワードは送らない
    const payload = { ...data }
    if (!payload.password) {
      delete payload.password
      delete payload.password_confirmation
    }
    update.mutate(payload, {
      onSuccess: () => reset({ name: user?.name, email: user?.email, password: '', password_confirmation: '' }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
        <input
          {...register('name')}
          type="text"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          新しいパスワード <span className="text-gray-400 font-normal">（変更する場合のみ）</span>
        </label>
        <input
          {...register('password')}
          type="password"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="8文字以上"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード（確認）</label>
        <input
          {...register('password_confirmation')}
          type="password"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.password_confirmation && (
          <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>
        )}
      </div>

      {update.isSuccess && (
        <p className="text-green-600 text-sm">プロフィールを更新しました</p>
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
  )
}
