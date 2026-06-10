import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { shopCheckoutSchema } from '@/lib/shop/schema'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

const SHIPPING_COST_EUR = 20
const FREE_SHIPPING_THRESHOLD_EUR = 200

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = shopCheckoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    const itemsTotal = data.items.reduce((sum, i) => sum + i.price_eur * i.quantity, 0)
    const shippingEur = itemsTotal >= FREE_SHIPPING_THRESHOLD_EUR ? 0 : SHIPPING_COST_EUR
    const totalEur = itemsTotal + shippingEur

    const supabase = createServiceClient()

    // Opprett ventende ordre før Stripe-redirect
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        first_name:   data.first_name,
        last_name:    data.last_name,
        email:        data.email,
        phone:        data.phone ?? null,
        status:       'pending_payment',
        items:        data.items,
        total_eur:    totalEur,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('order insert error:', orderError)
      return NextResponse.json({ error: 'Kunne ikke opprette ordre' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ferabrand.com'

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = data.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(item.price_eur * 100),
        product_data: {
          name: item.name,
          description: item.brand,
          ...(item.image ? { images: [item.image] } : {}),
        },
      },
    }))

    if (shippingEur > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(shippingEur * 100),
          product_data: { name: 'Frakt (UPS til Norge)' },
        },
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode:           'payment',
      currency:       'eur',
      line_items:     lineItems,
      customer_email: data.email,
      metadata: {
        order_type: 'shop',
        order_id:   order.id,
      },
      shipping_address_collection: {
        allowed_countries: ['NO', 'SE', 'DK', 'FI'],
      },
      success_url: `${baseUrl}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/shop/checkout/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('shop checkout error:', err)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
