import type { Booking, WorkshopId } from "../models/booking"
import { TYPESCRIPT_CAPACITY, BUILD_CAPACITY } from "../data/capacities"

function countWorkshopSeats(items: Booking[], workshop: WorkshopId): number {
  let total = 0
  items.forEach((booking) => { if (booking.workshop === workshop) 
    total += booking.seats})

  return total
}

export function getRemainingSeats(items: Booking[], workshop: WorkshopId): number {
    const takenSeats = countWorkshopSeats(items, workshop)
    if (workshop === 'typescript') {
        return TYPESCRIPT_CAPACITY - takenSeats
    }

    return BUILD_CAPACITY - takenSeats
}

