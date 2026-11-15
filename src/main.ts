import './style.css'
import type { Booking, WorkshopId } from './models/booking'
import { ids } from './models/booking'

import { initialBookings } from './data/initial-bookings'
import { TYPESCRIPT_CAPACITY, BUILD_CAPACITY } from './data/capacities'
import { countSeats } from './lib/count-seats'
import { getRemainingSeats } from './lib/availability'

import workshopUrl from './assets/workshops.svg'

const bookings: Array<Booking> = [...initialBookings]

type Result<T> = {status: 'ok', 
                value: T} |
                {status: 'failed',
                  reason: string
                }

function readSeats(raw: FormDataEntryValue | null): Result<number> {
  if (typeof raw !== 'string' || raw.trim() === '') 
    return {status: 'failed', 
            reason: 'Укажите число участников.'}

  const seats = Number(raw)

  if (!Number.isInteger(seats) || seats < 1 || seats > 5) 
    return {
      status: 'failed',
      reason: 'Введите целое число участников от 1 до 5.'
    }

  return { status: 'ok', value: seats }
}

function readWorkshop(raw: FormDataEntryValue | null): Result<WorkshopId> {
  const match = ids.find(id => id === raw)
  if (match === undefined) {
    return { status: 'failed', reason: 'Выберите занятие из списка.' }
  }

  return { status: 'ok', value: match }
}

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Не найден контейнер приложения')

app.innerHTML = `
  <main class="workspace">
    <header class="header">
      <div>
        <p class="eyebrow">ВЕБ-МАСТЕРСКАЯ / УЧЕБНЫЕ ГРУППЫ</p>
        <h1>Встречаемся на практике</h1>
        <p class="lead">Выберите занятие и приходите своей небольшой командой.</p>
      </div>
      <img id="logo" class="logo" width="112" height="96" alt="" hidden>
    </header>

    <aside id="starter-notice" class="notice">
      <strong>Стартовая версия: общая запись.</strong>
      Выбор занятия и учёт свободных мест пока не подключены.
    </aside>

    <section class="sessions" aria-label="Занятия и свободные места">
      <article class="session">
        <span class="session-code">01 / КОНТРАКТЫ</span>
        <h2>TypeScript</h2>
        <p>Вместимость: ${TYPESCRIPT_CAPACITY} человек</p>
        <p class="availability">Свободно: <strong id="typescript-free">не рассчитано</strong></p>
      </article>
      <article class="session session--blue">
        <span class="session-code">02 / ИНСТРУМЕНТЫ</span>
        <h2>Сборка проекта</h2>
        <p>Вместимость: ${BUILD_CAPACITY} человек</p>
        <p class="availability">Свободно: <strong id="build-free">не рассчитано</strong></p>
      </article>
    </section>

    <div class="columns">
      <section class="panel">
        <h2>Новая заявка</h2>
        <form id="booking-form" novalidate>
          <label for="name">Имя</label>
          <input id="name" name="name" autocomplete="given-name" placeholder="Как к вам обращаться?">

          <label for="workshop">Занятие</label>
          <select id="workshop" name="workshop" disabled>
            <option value="">Выберите занятие</option>
            <option value="typescript">TypeScript</option>
            <option value="build">Сборка проекта</option>
          </select>

          <label for="seats">Участников</label>
          <input id="seats" name="seats" type="text" inputmode="numeric" value="1" aria-describedby="seats-hint">
          <small id="seats-hint">Целое число от 1 до 5 в одной заявке.</small>
          <button type="submit">Записаться</button>
          <p id="message" class="message" role="status" aria-live="polite"></p>
        </form>
      </section>

      <section class="panel">
        <div class="list-heading">
          <h2>Уже записались</h2>
          <span class="counter">Участников: <strong id="total">0</strong></span>
        </div>
        <ul id="bookings" class="bookings"></ul>
        <p class="muted">Данные хранятся в памяти. Перезагрузка вернёт две исходные заявки.</p>
      </section>
    </div>
    <footer>Веб-мастерская <span>Учимся на небольших работающих проектах</span></footer>
  </main>`

const form = document.querySelector('#booking-form')
const list = document.querySelector('#bookings')
const total = document.querySelector('#total')
const message = document.querySelector('#message')
const workshop = document.querySelector('#workshop')
const typescriptFree = document.querySelector('#typescript-free')
const buildFree = document.querySelector('#build-free')
const logo = document.querySelector('#logo')
const notice = document.querySelector('#starter-notice')

if (!(form instanceof HTMLFormElement) || !(list instanceof HTMLUListElement)
  || !(total instanceof HTMLElement) || !(message instanceof HTMLElement)
  || !(workshop instanceof HTMLSelectElement) || !(typescriptFree instanceof HTMLElement)
  || !(buildFree instanceof HTMLElement) || !(logo instanceof HTMLImageElement)
  || !(notice instanceof HTMLElement)) {
  throw new Error('Не найдены элементы интерфейса')
}


const ui = { form, list, total, message, workshop, typescriptFree, buildFree, logo, notice }

ui.workshop.disabled = false
ui.notice.remove()

ui.logo.hidden = false
ui.logo.src = workshopUrl

function render(items: Booking[]) {
  ui.list.replaceChildren()
  items.forEach((booking) => {
    const item = document.createElement('li')
    const title = document.createElement('strong')
    const details = document.createElement('span')
    title.textContent = booking.name

    details.textContent = `${booking.seats} участн. 
    · ${booking.status === 'confirmed' ? 'Подтверждена' : 'Новая'}
     · ${booking.source}
     · ${booking.workshop === 'typescript' ? 'TypeScript' : 'Сборка проекта'}`
 
    item.append(title, details)
    ui.list.append(item)
  })

  ui.total.textContent = String(countSeats(items))
  ui.typescriptFree.textContent = String(getRemainingSeats(items, 'typescript'))
  ui.buildFree.textContent = String(getRemainingSeats(items, 'build'))
}

ui.form.addEventListener('submit', (event) => {
  event.preventDefault()
  const data = new FormData(ui.form)
  const rawName = data.get('name')
  if (typeof rawName !== 'string' || rawName.trim() === '') {
    ui.message.textContent = 'Укажите имя.'
    return
  }

  const seatsResult = readSeats(data.get('seats'))

  if (seatsResult.status === 'failed') {
    ui.message.textContent = seatsResult.reason
    return
  }

  const seats = seatsResult.value 

  const workshopResult = readWorkshop(data.get('workshop'))

  if (workshopResult.status === 'failed') {
    ui.message.textContent = workshopResult.reason
    return
  }

  const selectedWorkshop = workshopResult.value

  const remainingSeatsCount = getRemainingSeats(bookings, selectedWorkshop)
  if (seats > remainingSeatsCount) {
    ui.message.textContent = `Недостаточно мест для вашей группы. \
                              Свободных мест: ${remainingSeatsCount}`
    return
  }

  const booking: Booking = {
    id: crypto.randomUUID(),
    name: rawName.trim(),
    seats,
    status: 'new',
    source: 'web',
    workshop: selectedWorkshop
  }
  
  bookings.push(booking)
  render(bookings)
  ui.message.textContent = 'Заявка добавлена.'
  ui.form.reset()
})

render(bookings)
