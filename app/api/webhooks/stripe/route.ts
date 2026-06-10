import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendOpsOrderEmail, type OpsOrderPayload } from '@/lib/shop/email'
import type { CartItemData } from '@/lib/shop/schema'

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
    const orderId   = session.metadata?.order_id

    // FeraTravels-booking
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

    // FeraShop-ordre
    if (orderId) {
      await handleShopOrder(session, orderId)
    }
  }

  return NextResponse.json({ received: true })
}

type SessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    name?: string | null
    address?: {
      line1?: string | null
      line2?: string | null
      city?: string | null
      postal_code?: string | null
      country?: string | null
    } | null
  } | null
}

async function handleShopOrder(session: Stripe.Checkout.Session, orderId: string) {
  const supabase = createServiceClient()

  const s = session as SessionWithShipping
  const shipping = s.shipping_details

  const shippingAddress = shipping?.address
    ? {
        name:        shipping?.name        ?? null,
        line1:       shipping.address.line1       ?? null,
        line2:       shipping.address.line2       ?? null,
        city:        shipping.address.city        ?? null,
        postal_code: shipping.address.postal_code ?? null,
        country:     shipping.address.country     ?? null,
      }
    : null

  // Oppdater ordre til 'paid'
  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update({
      status:           'paid',
      stripe_session_id: session.id,
      shipping_address:  shippingAddress,
    })
    .eq('id', orderId)
    .select('*')
    .single()

  if (updateError || !order) {
    console.error('order update error:', updateError)
    return
  }

  const payload: OpsOrderPayload = {
    order_id:    orderId,
    first_name:  order.first_name ?? '',
    last_name:   order.last_name  ?? '',
    email:       order.email,
    phone:       order.phone ?? undefined,
    items:       order.items as CartItemData[],
    total_eur:   order.total_eur ?? 0,
    shipping_address: shippingAddress,
  }

  // Send ops-varsel via Resend
  try {
    await sendOpsOrderEmail(payload)
  } catch (emailErr) {
    console.error('Resend send failed, logging to pending_notifications:', emailErr)
    await supabase.from('pending_notifications').insert({
      order_id: orderId,
      payload:  JSON.parse(JSON.stringify(payload)),
    })
  }
}
