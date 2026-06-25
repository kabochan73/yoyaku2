import Link from 'next/link'
import { LogoutButton } from './_components/LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">管理者ページ</span>
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-sm text-gray-700 hover:text-green-600">
              予約
            </Link>
            <Link href="/admin/pricing" className="text-sm text-gray-700 hover:text-green-600">
              料金
            </Link>
            <Link href="/admin/holidays" className="text-sm text-gray-700 hover:text-green-600">
              定休日
            </Link>
            <Link href="/admin/users" className="text-sm text-gray-700 hover:text-green-600">
              ユーザー
            </Link>
            <Link href="/admin/analytics" className="text-sm text-gray-700 hover:text-green-600">
              売り上げ
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
