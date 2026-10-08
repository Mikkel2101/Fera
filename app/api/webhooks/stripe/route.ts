import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { sendOpsOrderEmail, sendCustomerOrderConfirmation, type OpsOrderPayload } from '@/lib/shop/email'
import { triggerPadelpointOrder } from '@/lib/shop/github'
import type { CartItemData } from '@/lib/shop/schema'


export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = await getStripe('webhook').webhooks.constructEventAsync(
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

    // FeraTravels-booking — bruk serviceClient (ingen cookie-sesjon i webhook)
    if (bookingId) {
      const supabase = createServiceClient()
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

  // Atomisk idempotens: oppdater KUN rader som ikke allerede er 'paid'.
  // Postgres radlåser UPDATE-en, så to nesten-samtidige webhook-leveranser
  // (Stripe retries) kan aldri begge vinne — kun én får raden tilbake.
  // Ingen separat "les status først"-steg, som ville latt begge passere
  // sjekken før noen rakk å skrive.
  // Bruk Stripes faktiske belastede beløp som endelig NOK-fasit — dette er
  // autoritativt uansett hvordan checkout-siden regnet det ut, og fjerner
  // enhver drift fra kurssvingninger etterpå (se migrasjon 020).
  const totalNok = (session.amount_total ?? 0) / 100

  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update({
      status:           'paid',
      stripe_session_id: session.id,
      shipping_address:  shippingAddress,
      total_nok:         totalNok,
    })
    .eq('id', orderId)
    .neq('status', 'paid')
    .select('*')
    .single()

  if (updateError || !order) {
    // Enten fantes ikke ordren, eller den var allerede markert 'paid'
    // av en annen webhook-levering — begge er trygge å hoppe over.
    console.log('Order update skipped (not found or already paid):', orderId, updateError?.code)
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
    console.error('Resend ops email failed, logging to pending_notifications:', emailErr)
    await supabase.from('pending_notifications').insert({
      order_id: orderId,
      payload:  JSON.parse(JSON.stringify(payload)),
    })
  }

  // Send ordrebekreftelse til kunden (samme NOK-beløp som ble lagret over)
  try {
    await sendCustomerOrderConfirmation({
      order_id:         orderId,
      first_name:       order.first_name ?? '',
      last_name:        order.last_name  ?? '',
      email:            order.email,
      items:            order.items as CartItemData[],
      total_nok:        totalNok,
      shipping_address: shippingAddress,
    })
  } catch (confirmErr) {
    console.error('Resend customer confirmation failed:', confirmErr)
  }

  // Trigger Playwright auto-order via GitHub Actions
  const dispatchItems = (order.items as CartItemData[]).map((item) => ({
    product_id:     item.product_id,
    name:           item.name,
    quantity:       item.quantity,
    price_eur:      item.price_eur,
    padelpoint_url: item.padelpoint_url ?? null,
  }))

  try {
    await triggerPadelpointOrder({ order_id: orderId, items: dispatchItems })
  } catch (dispatchErr) {
    console.error('[github-dispatch] trigger failed:', dispatchErr)
    await supabase.from('pending_order_automations').insert({
      order_id: orderId,
      payload:  { order_id: orderId, items: dispatchItems },
      status:   'failed',
      last_error: String(dispatchErr),
    })
  }
}
