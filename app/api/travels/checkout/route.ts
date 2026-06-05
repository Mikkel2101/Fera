import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { bookingSchema } from '@/lib/booking/schema'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    const supabase = await createClient()

    const { data: trip } = await supabase
      .from('trips')
      .select('id, name, deposit_eur, extras, status, published')
      .eq('id', data.trip_id)
      .single()

    if (!trip || !trip.published || trip.status === 'Fullbooket') {
      return NextResponse.json({ error: 'Tur ikke tilgjengelig' }, { status: 422 })
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        trip_id:         data.trip_id,
        first_name:      data.first_name,
        last_name:       data.last_name,
        email:           data.email,
        phone:           data.phone           ?? null,
        padel_level:     data.padel_level     ?? null,
        room_type:       data.room_type,
        roommate_name:   data.roommate_name   ?? null,
        selected_extras: data.selected_extras,
        deposit_status:  'Ventende',
        gdpr_consent:    data.gdpr_consent,
        terms_accepted:  data.terms_accepted,
      })
      .select('id')
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Kunne ikke opprette booking' }, { status: 500 })
    }

    const extras = (trip.extras ?? []) as Array<{ name: string; price_eur: number }>
    const extrasTotal = data.selected_extras.reduce((sum, extraName) => {
      const extra = extras.find(e => e.name === extraName)
      return sum + (extra?.price_eur ?? 0)
    }, 0)
    const totalEur = trip.deposit_eur + extrasTotal

    const session = await stripe.checkout.sessions.create({
      mode:     'payment',
      currency: 'eur',
      line_items: [{
        quantity:   1,
        price_data: {
          currency:     'eur',
          unit_amount:  Math.round(totalEur * 100),
          product_data: { name: `Depositum — ${trip.name}` },
        },
      }],
      customer_email: data.email,
      metadata:       { booking_id: booking.id },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/travels/${data.trip_id}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_BASE_URL}/travels/${data.trip_id}/book/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('checkout error:', err)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
