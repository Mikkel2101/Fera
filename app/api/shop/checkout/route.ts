import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

interface CartItem {
  product_id: string
  name: string
  brand: string
  price_eur: number
  quantity: number
  image?: string
}

export async function POST(request: NextRequest) {
  try {
    const { items, email }: { items: CartItem[]; email?: string } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Handlekurven er tom' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ferabrand.com'

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
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

    const orderSummary = items
      .map((i) => `${i.name} x${i.quantity}`)
      .join(', ')

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'eur',
      line_items: lineItems,
      ...(email ? { customer_email: email } : {}),
      metadata: {
        order_type: 'shop',
        order_summary: orderSummary.slice(0, 500),
        item_count: String(items.reduce((s, i) => s + i.quantity, 0)),
      },
      shipping_address_collection: {
        allowed_countries: ['NO', 'SE', 'DK', 'FI'],
      },
      success_url: `${baseUrl}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop/checkout/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('shop checkout error:', err)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
