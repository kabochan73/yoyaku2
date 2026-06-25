import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z.string().min(1, '名前を入力してください'),
    email: z.string().email({ message: '正しいメールアドレスを入力してください' }),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'パスワードが一致しません',
    path: ['password_confirmation'],
  })

export const loginSchema = z.object({
  email: z.string().email({ message: '正しいメールアドレスを入力してください' }),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export const profileSchema = z
  .object({
    name: z.string().min(1, '名前を入力してください').optional(),
    email: z.string().email({ message: '正しいメールアドレスを入力してください' }).optional(),
    password: z.string().min(8, 'パスワードは8文字以上').optional().or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => !data.password || data.password === data.password_confirmation,
    {
      message: 'パスワードが一致しません',
      path: ['password_confirmation'],
    },
  )

export const reservationSchema = z.object({
  start_datetime: z.string().min(1, '日時を選択してください'),
  hours: z.number().min(2).max(4),
})

export const pricingSchema = z.object({
  base_price: z.number().min(0, '0以上の金額を入力してください'),
  extra_hour_price: z.number().min(0, '0以上の金額を入力してください'),
})

export const holidaySchema = z.object({
  date: z.string().min(1, '日付を選択してください'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ReservationInput = z.infer<typeof reservationSchema>
export type PricingInput = z.infer<typeof pricingSchema>
export type HolidayInput = z.infer<typeof holidaySchema>
