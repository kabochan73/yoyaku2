export type Role = 'user' | 'admin'

export type User = {
  id: number
  name: string
  email: string
  role: Role
}

export type ReservationStatus = 'confirmed' | 'cancelled'

export type Reservation = {
  id: number
  user_id: number
  start_datetime: string
  end_datetime: string
  hours: number
  total_price: number
  status: ReservationStatus
  user?: User
}

export type Holiday = {
  id: number
  date: string
}

export type Pricing = {
  id: number
  base_price: number
  extra_hour_price: number
}
