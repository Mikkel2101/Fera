import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { bookingSchema } from '@/lib/booking/schema'
import { reservationErrorResponse } from '@/lib/booking/reservation'
import { formatBookedExtra, parseTripExtras, resolveExtras } from '@/lib/booking/extras'
import { calculatePrice } from '@/lib/booking/pricing'
import { roomTypeFor } from '@/lib/booking/rooms'
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
      .select('id, name, destination, start_date, end_date, extras, price_double_eur, price_single_eur, deposit_eur')
      .eq('id', data.trip_id)
      .eq('published', true)
      .single()

    if (!trip) {
      return NextResponse.json({ error: 'Turen finnes ikke.' }, { status: 404 })
    }

    // Pris og gyldige tillegg hentes fra turen — aldri fra klienten
    const extrasCheck = resolveExtras(data.extras, parseTripExtras(trip.extras))
    if (!extrasCheck.ok) {
      return NextResponse.json({ error: extrasCheck.error }, { status: 400 })
    }
    const bookedExtras  = extrasCheck.items
    const extrasSummary = bookedExtras.map(formatBookedExtra)
    const roomType      = roomTypeFor(data.room_preference)
    const price         = calculatePrice({
      price_double_eur: trip.price_double_eur,
      price_single_eur: trip.price_single_eur ?? trip.price_double_eur,
      deposit_eur:      trip.deposit_eur,
    }, roomType, bookedExtras)
    const roommateName  = data.room_preference === 'partner' ? data.roommate_name ?? null : null
    const shareGender   = data.room_preference === 'match' ? data.room_share_gender ?? null : null

    const service = createServiceClient()

    // bookings.user_id peker på public.users — sørg for at raden finnes
    // (auth-callbacken oppretter den, men stol ikke på det alene).
    // newsletter_consent og preferred_side settes bare når kunden har valgt dem,
    // så et tidligere valg i profilen aldri overskrives med tomt.
    const { error: userError } = await service.from('users').upsert(
      {
        id:          user.id,
        full_name:   `${data.first_name} ${data.last_name}`,
        phone:       data.phone,
        padel_level: data.padel_level,
        ...(data.preferred_side ? { preferred_side: data.preferred_side } : {}),
        ...(data.newsletter_consent ? { newsletter_consent: true } : {}),
      },
      { onConflict: 'id' },
    )
    if (userError) {
      console.error('reserve: users upsert failed:', userError)
      return NextResponse.json({ error: 'Kunne ikke reservere plass. Prøv igjen.' }, { status: 500 })
    }

    const { data: bookingId, error: rpcError } = await service.rpc('reserve_trip_spot', {
      p_user_id:           user.id,
      p_trip_id:           trip.id,
      p_first_name:        data.first_name,
      p_last_name:         data.last_name,
      p_email:             user.email,
      p_phone:             data.phone,
      p_padel_level:       data.padel_level,
      p_room_type:         roomType,
      p_room_preference:   data.room_preference,
      p_roommate_name:     roommateName,
      p_room_share_gender: shareGender,
      p_trip_goal:         data.trip_goal ?? null,
      p_special_requests:  data.special_requests ?? null,
      p_selected_extras:   extrasSummary,
      p_extras_detail:     bookedExtras,
      p_price_total_eur:   price.total,
      p_gdpr_consent:      data.gdpr_consent,
      p_terms_accepted:    data.terms_accepted,
    })

    if (rpcError || !bookingId) {
      const res = reservationErrorResponse(rpcError?.message ?? '')
      if (res.code === 'UNKNOWN') console.error('reserve: rpc failed:', rpcError)
      return NextResponse.json({ error: res.error, code: res.code }, { status: res.status })
    }

    await sendReservationEmails({
      booking_id:        bookingId,
      first_name:        data.first_name,
      last_name:         data.last_name,
      email:             user.email,
      phone:             data.phone,
      padel_level:       data.padel_level,
      preferred_side:    data.preferred_side ?? null,
      room_type:         roomType,
      room_preference:   data.room_preference,
      roommate_name:     roommateName,
      room_share_gender: shareGender,
      trip_goal:         data.trip_goal ?? null,
      special_requests:  data.special_requests ?? null,
      selected_extras:   extrasSummary,
      price,
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
