import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { bookingSchema } from '@/lib/booking/schema'
import { filterValidExtras, reservationErrorResponse } from '@/lib/booking/reservation'
import {
  sendOpsReservationEmail,
  sendReservationConfirmation,
  type ReservationEmailPayload,
} from '@/lib/booking/email'

// Uforpliktende reservasjon — erstatter Stripe-checkout til Fera har org.nr.
// (app/api/travels/checkout beholdes til betaling skal på igjen).
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: 'Du må være logget inn for å reservere.' }, { status: 401 })
    }

    const body   = await request.json().catch(() => null)
    const parsed = bookingSchema.safeParse({ ...body, email: user.email })
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ugyldige opplysninger', details: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    const { data: trip } = await supabase
      .from('trips')
      .select('id, name, destination, start_date, end_date, extras')
      .eq('id', data.trip_id)
      .eq('published', true)
      .single()

    if (!trip) {
      return NextResponse.json({ error: 'Turen finnes ikke.' }, { status: 404 })
    }

    const service = createServiceClient()

    // bookings.user_id peker på public.users — sørg for at raden finnes
    // (auth-callbacken oppretter den, men stol ikke på det alene).
    // newsletter_consent settes bare når kunden krysser av, så et tidligere
    // samtykke aldri overskrives med false.
    const { error: userError } = await service.from('users').upsert(
      {
        id:        user.id,
        full_name: `${data.first_name} ${data.last_name}`,
        phone:     data.phone ?? null,
        ...(data.newsletter_consent ? { newsletter_consent: true } : {}),
      },
      { onConflict: 'id' },
    )
    if (userError) {
      console.error('reserve: users upsert failed:', userError)
      return NextResponse.json({ error: 'Kunne ikke reservere plass. Prøv igjen.' }, { status: 500 })
    }

    const selectedExtras = filterValidExtras(
      data.selected_extras,
      (trip.extras ?? []) as Array<{ name: string }>,
    )

    const { data: bookingId, error: rpcError } = await service.rpc('reserve_trip_spot', {
      p_user_id:         user.id,
      p_trip_id:         trip.id,
      p_first_name:      data.first_name,
      p_last_name:       data.last_name,
      p_email:           user.email,
      p_phone:           data.phone ?? null,
      p_padel_level:     data.padel_level ?? null,
      p_room_type:       data.room_type,
      p_roommate_name:   data.room_type === 'Dobbel' ? data.roommate_name ?? null : null,
      p_selected_extras: selectedExtras,
      p_gdpr_consent:    data.gdpr_consent,
      p_terms_accepted:  data.terms_accepted,
    })

    if (rpcError || !bookingId) {
      const res = reservationErrorResponse(rpcError?.message ?? '')
      if (res.code === 'UNKNOWN') console.error('reserve: rpc failed:', rpcError)
      return NextResponse.json({ error: res.error, code: res.code }, { status: res.status })
    }

    await sendReservationEmails({
      booking_id:      bookingId,
      first_name:      data.first_name,
      last_name:       data.last_name,
      email:           user.email,
      phone:           data.phone ?? null,
      padel_level:     data.padel_level ?? null,
      room_type:       data.room_type,
      roommate_name:   data.roommate_name ?? null,
      selected_extras: selectedExtras,
      trip: {
        id:          trip.id,
        name:        trip.name,
        destination: trip.destination,
        start_date:  trip.start_date,
        end_date:    trip.end_date,
      },
    })

    return NextResponse.json({ booking_id: bookingId })
  } catch (err) {
    console.error('reserve error:', err)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}

// Reservasjonen er allerede lagret — en e-postfeil skal ikke gi kunden en
// feilmelding, men logges så den kan følges opp manuelt fra admin.
async function sendReservationEmails(payload: ReservationEmailPayload) {
  const results = await Promise.allSettled([
    sendReservationConfirmation(payload),
    sendOpsReservationEmail(payload),
  ])
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`reserve: ${i === 0 ? 'kunde' : 'ops'}-e-post feilet for ${payload.booking_id}:`, result.reason)
    }
  })
}
