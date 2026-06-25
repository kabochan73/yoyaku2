'use client'

import dynamic from 'next/dynamic'

const WeeklyCalendar = dynamic(
  () => import('./WeeklyCalendar').then((m) => m.WeeklyCalendar),
  { ssr: false },
)

export const WeeklyCalendarClient = () => <WeeklyCalendar />
