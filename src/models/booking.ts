export type BookingStatus = 'new' | 'confirmed'

export const ids = ['typescript' ,'build'] as const

export type WorkshopId = (typeof ids)[number]

// HW-А1: добавьте WorkshopId и обязательное поле workshop в Booking.
export interface Booking {
  id: string
  name: string
  seats: number
  status: BookingStatus
  source: 'web'
  workshop: WorkshopId
}
