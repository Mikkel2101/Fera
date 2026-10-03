// Reservasjonsstatus på bookings.status (migrasjon 021). Felles for
// kundens kontosider og admin, så etiketter og farger holdes like.

export const BOOKING_STATUSES = ['Reservert', 'Bekreftet', 'Kansellert'] as const
export type BookingStatus = typeof BOOKING_STATUSES[number]

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  Reservert:  'Plass reservert',
  Bekreftet:  'Bekreftet',
  Kansellert: 'Kansellert',
}

export const BOOKING_STATUS_COLOR: Record<BookingStatus, string> = {
  Reservert:  'bg-(--color-sand) text-(--color-text)',
  Bekreftet:  'bg-(--color-success) text-white',
  Kansellert: 'bg-(--color-border) text-(--color-subtle)',
}

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string' && (BOOKING_STATUSES as readonly string[]).includes(value)
}

export function bookingStatusLabel(status: string): string {
  return isBookingStatus(status) ? BOOKING_STATUS_LABEL[status] : status
}

export function bookingStatusColor(status: string): string {
  return isBookingStatus(status) ? BOOKING_STATUS_COLOR[status] : 'bg-(--color-border) text-(--color-subtle)'
}
