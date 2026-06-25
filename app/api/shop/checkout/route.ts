import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { shopCheckoutSchema } from '@/lib/shop/schema'
import { fetchEurNokRate, eurToNok } from '@/lib/currency'

// vipps_preview=v1 krever at preview-flagget er en del av Stripe-Version-headeren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-05-27.dahlia; vipps_preview=v1' as any,
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

    const supabase = createServiceClient()

    // Hent server-side priser — ignorer klient-pris for å forhindre prismanipulasjon
    const productIds = data.items.map(i => i.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price_eur, name, stock_status, published')
      .in('id', productIds)
      .eq('published', true)

    if (productsError || !products) {
      return NextResponse.json({ error: 'Kunne ikke verifisere produkter' }, { status: 500 })
    }

    const productMap = new Map(products.map(p => [p.id, p]))

    for (const item of data.items) {
      const product = productMap.get(item.product_id)
      if (!product) {
        return NextResponse.json({ error: `Produkt ikke tilgjengelig: ${item.name}` }, { status: 422 })
      }
      if (product.stock_status === 'out_of_stock') {
        return NextResponse.json({ error: `Produkt er utsolgt: ${product.name}` }, { status: 422 })
      }
    }

    const itemsTotalEur = data.items.reduce((sum, i) => {
      const serverPrice = productMap.get(i.product_id)!.price_eur
      return sum + serverPrice * i.quantity
    }, 0)
    const shippingEur   = itemsTotalEur >= FREE_SHIPPING_THRESHOLD_EUR ? 0 : SHIPPING_COST_EUR
    const totalEur      = itemsTotalEur + shippingEur

    // Hent EUR→NOK-kurs for Stripe-sesjonen (Vipps krever NOK)
    const nokRate = await fetchEurNokRate()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ferabrand.com'

    // Pre-generer ordre-ID slik at Stripe-metadata og DB-rad deler samme ID fra start
    const orderId = randomUUID()

    // Stripe Checkout i NOK — Vipps støtter kun NOK
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = data.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency:    'nok',
        unit_amount: eurToNok(productMap.get(item.product_id)!.price_eur, nokRate) * 100, // øre — server-side pris
        product_data: {
          name:        item.name,
          description: item.brand,
          ...(item.image ? { images: [item.image] } : {}),
        },
      },
    }))

    if (shippingEur > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency:    'nok',
          unit_amount: eurToNok(shippingEur, nokRate) * 100, // øre
          product_data: { name: 'Frakt (UPS til Norge)' },
        },
      })
    }

    // Opprett Stripe-sesjon FØRST — unngår foreldreløse DB-rader hvis Stripe feiler
    const session = await stripe.checkout.sessions.create({
      mode:       'payment',
      line_items: lineItems,
      customer_email: data.email,
      metadata: {
        order_type: 'shop',
        order_id:   orderId,
      },
      shipping_address_collection: {
        allowed_countries: ['NO', 'SE', 'DK', 'FI'],
      },
      success_url: `${baseUrl}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/shop/checkout/cancel`,
    })

    // Opprett ordre i DB med stripe_session_id allerede kjent
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id:                orderId,
        first_name:        data.first_name,
        last_name:         data.last_name,
        email:             data.email,
        phone:             data.phone ?? null,
        status:            'pending_payment',
        items:             data.items,
        total_eur:         totalEur,
        stripe_session_id: session.id,
      })

    if (orderError) {
      console.error('order insert error:', orderError)
      return NextResponse.json({ error: 'Kunne ikke opprette ordre' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('shop checkout error:', err)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
