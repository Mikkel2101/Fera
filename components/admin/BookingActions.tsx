'use client'

import { cancelBooking, confirmBooking } from '@/lib/actions/bookings'

type Props = {
  bookingId: string
  status:    string
  name:      string
}

export default function BookingActions({ bookingId, status, name }: Props) {
  if (status === 'Kansellert') return <span className="text-xs text-(--color-muted)">—</span>

  return (
    <div className="flex items-center gap-3">
      {status === 'Reservert' && (
        <form action={confirmBooking}>
          <input type="hidden" name="booking_id" value={bookingId} />
          <button type="submit" className="text-xs font-medium text-(--color-success) hover:underline">
            Bekreft
          </button>
        </form>
      )}
      <form action={cancelBooking}>
        <input type="hidden" name="booking_id" value={bookingId} />
        <button
          type="submit"
          className="text-xs text-(--color-muted) hover:text-red-500 transition-colors"
          onClick={e => { if (!confirm(`Kansellere reservasjonen til ${name}? Plassen frigjøres.`)) e.preventDefault() }}
        >
          Kanseller
        </button>
      </form>
    </div>
  )
}
