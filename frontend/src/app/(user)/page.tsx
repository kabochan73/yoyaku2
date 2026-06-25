import { WeeklyCalendar } from './_components/WeeklyCalendar'

export default function TopPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      {/* 施設情報 */}
      <section>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          フットサルコートへようこそ
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="営業時間" content="10:00 〜 22:00（最終受付 20:00）" />
          <InfoCard title="料金" content="2時間 ¥10,000 / 延長1時間 ¥5,000" />
          <InfoCard title="住所" content="〇〇県〇〇市〇〇町1-2-3" />
          <InfoCard title="お問い合わせ" content="000-0000-0000" />
          <InfoCard title="支払い方法" content="現金・クレジットカード" />
          <InfoCard
            title="設備・レンタル"
            content="シャワー・ロッカー / ビブス・ボールレンタルあり"
          />
        </div>
      </section>

      {/* 予約カレンダー */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">予約カレンダー</h2>
        <WeeklyCalendar />
      </section>

      {/* 利用規約 */}
      <section className="text-sm text-gray-600 border-t pt-8 space-y-2">
        <h2 className="text-base font-bold text-gray-800 mb-3">利用規約</h2>
        <p>・予約は来月末まで受け付けています。</p>
        <p>・最低利用時間は2時間、最大4時間です。</p>
        <p>・キャンセルはマイページから行えます。</p>
        <p>・営業時間は10:00〜22:00です（最終受付20:00）。</p>
      </section>
    </div>
  )
}

const InfoCard = ({ title, content }: { title: string; content: string }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
      {title}
    </dt>
    <dd className="text-gray-800">{content}</dd>
  </div>
)
