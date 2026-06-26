import { Suspense } from 'react'
import Image from 'next/image'
import { WeeklyCalendarClient } from './_components/WeeklyCalendarClient'
import { PricingCard } from './_components/PricingCard'

export default function TopPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* 施設情報 */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 左上：施設情報 */}
          <div className="grid grid-cols-1 gap-1 content-start">
            <InfoCard title="営業時間" content="10:00 〜 22:00（最終受付 20:00）" />
            <Suspense fallback={<InfoCard title="料金" content="読み込み中..." />}>
              <PricingCard />
            </Suspense>
            <InfoCard title="利用時間" content="最低2時間 〜 最大4時間" />
            <InfoCard title="住所" content="〇〇県〇〇市〇〇町1-2-3" />
          </div>
          {/* 右上：画像 */}
          <div className="relative h-64 md:h-auto rounded-lg overflow-hidden">
            <Image src="/court1.jpg" alt="フットサルコート" fill className="object-cover" />
          </div>
          {/* 左下：画像 */}
          <div className="relative h-64 md:h-auto rounded-lg overflow-hidden">
            <Image src="/court2.jpg" alt="フットサルコート" fill className="object-cover" />
          </div>
          {/* 右下：施設情報 */}
          <div className="grid grid-cols-1 gap-1 content-start">
            <InfoCard title="定休日" content="毎週月曜日" />
            <InfoCard title="お問い合わせ" content="000-0000-0000" />
            <InfoCard title="支払い方法" content="現地払い（現金のみ）" />
            <InfoCard title="設備・レンタル" content="ビブス・ボールレンタルあり" />
          </div>
        </div>
      </section>

      {/* 予約カレンダー */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">予約カレンダー</h2>
        <Suspense fallback={<div className="h-64" />}>
          <WeeklyCalendarClient />
        </Suspense>
      </section>

      {/* 利用規約 */}
      <section className="text-sm text-gray-600 border-t pt-8 space-y-2">
        <h2 className="text-base font-bold text-gray-800 mb-3">利用規約</h2>
        <p>・予約は来月末まで受け付けています。</p>
        <p>・最低利用時間は2時間、最大4時間です。</p>
        <p>・キャンセルはマイページから行えます。</p>
        <p>・当日キャンセルはご利用料金の100%、3日前までのキャンセルは50%のキャンセル料が発生します。</p>
        <p>・営業時間は10:00〜22:00です（最終受付20:00）。</p>
      </section>
    </div>
  )
}

const InfoCard = ({ title, content }: { title: string; content: string }) => (
  <div className="rounded-lg px-4 py-2">
    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
      {title}
    </dt>
    <dd className="text-gray-800">{content}</dd>
  </div>
)
