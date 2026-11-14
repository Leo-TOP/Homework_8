// HW-А3, HW-Б1: добавьте экспортируемые функции:
// countWorkshopSeats(items: Booking[], workshop: WorkshopId): number
// Суммирует число участников выбранного занятия.
// getRemainingSeats(items: Booking[], workshop: WorkshopId): number
// Возвращает вместимость минус занятые места.
// Типы находятся в ../models/booking, лимиты в ../data/capacities.
// Расчёты не меняют массив и не обращаются к DOM.

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

