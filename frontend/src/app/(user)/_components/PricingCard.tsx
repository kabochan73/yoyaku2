import type { Pricing } from '@/types'

async function getPricing(): Promise<Pricing | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/pricing`,
      { cache: 'no-store' },
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function PricingCard() {
  const pricing = await getPricing()

  const content = pricing
    ? `2時間 ¥${pricing.base_price.toLocaleString()} / 延長1時間 ¥${pricing.extra_hour_price.toLocaleString()}`
    : '2時間 ¥10,000 / 延長1時間 ¥5,000'

  return (
    <div className="rounded-lg px-4 py-2">
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        料金
      </dt>
      <dd className="text-gray-800">{content}</dd>
    </div>
  )
}
