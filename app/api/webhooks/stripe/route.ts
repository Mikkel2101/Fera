import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch {
    return NextResponse.json({ error: 'Webhook signature mismatch' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session   = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.booking_id

    if (bookingId) {
      const supabase = await createClient()
      await supabase
        .from('bookings')
        .update({
          deposit_status:    'Betalt',
          deposit_date:      new Date().toISOString(),
          stripe_session_id: session.id,
        })
        .eq('id', bookingId)
    }
  }

  return NextResponse.json({ received: true })
}
