'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { User } from '@/types'

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await api.get<User[]>('/api/admin/users')
      return res.data
    },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ユーザー一覧</h1>

      {isLoading ? (
        <p className="text-gray-500 text-sm">読み込み中...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-sm">ユーザーはいません</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">名前</th>
              <th className="pb-2 font-medium">メールアドレス</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-3 text-gray-800">{u.name}</td>
                <td className="py-3 text-gray-600">{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
