/**
 * Playwright bot: places a wholesale order on tiendapadelpoint.com.
 * Triggered by GitHub Actions via repository_dispatch after Stripe payment.
 *
 * Env vars required:
 *   ORDER_JSON                    — JSON string: { order_id, items }
 *   PADELPOINT_WHOLESALE_EMAIL
 *   PADELPOINT_WHOLESALE_PASSWORD
 *   RESEND_API_KEY
 *   OPS_EMAIL
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://www.tiendapadelpoint.com'

type OrderItem = {
  product_id:     string
  name:           string
  quantity:       number
  price_eur:      number
  padelpoint_url: string | null
}

type OrderPayload = {
  order_id: string
  items:    OrderItem[]
}

function env(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

async function sendFailureAlert(orderId: string, error: string, screenshot?: Buffer) {
  const apiKey   = process.env.RESEND_API_KEY
  const opsEmail = process.env.OPS_EMAIL
  if (!apiKey || !opsEmail) return

  const body: Record<string, unknown> = {
    from:    'Fera Bot <bot@ferabrand.com>',
    to:      [opsEmail],
    subject: `[Fera] Auto-ordre FEILET — ordre ${orderId}`,
    html: `
      <h2>Auto-ordre feilet</h2>
      <p><strong>Ordre:</strong> ${orderId}</p>
      <p><strong>Feil:</strong> ${error}</p>
      <p>Logg inn på Padelpoint og legg inn ordren manuelt.</p>
    `,
  }

  if (screenshot) {
    body.attachments = [
      {
        filename:    'screenshot.png',
        content:     screenshot.toString('base64'),
        content_type: 'image/png',
      },
    ]
  }

  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  })
}

async function markOrderStatus(orderId: string, status: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return

  const supabase = createClient(url, key)
  await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
}

async function logAutomation(orderId: string, status: string, error?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return

  const supabase = createClient(url, key)
  await supabase.from('pending_order_automations').upsert(
    {
      order_id:   orderId,
      payload:    { order_id: orderId },
      status,
      attempts:   1,
      last_error: error ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'order_id' },
  )
}

async function run() {
  const rawJson = env('ORDER_JSON')
  const order: OrderPayload = JSON.parse(rawJson)

  const orderId  = order.order_id
  const email    = env('PADELPOINT_WHOLESALE_EMAIL')
  const password = env('PADELPOINT_WHOLESALE_PASSWORD')

  const itemsWithUrl = order.items.filter((i) => i.padelpoint_url)
  if (itemsWithUrl.length === 0) {
    console.log('[order-bot] No items with padelpoint_url — nothing to auto-order')
    await markOrderStatus(orderId, 'manual_order_required')
    return
  }

  console.log(`[order-bot] Starting auto-order for ${orderId} — ${itemsWithUrl.length} item(s)`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  })
  const page = await context.newPage()

  let screenshot: Buffer | undefined

  try {
    // ── 1. Login ─────────────────────────────────────────────────────────────
    console.log('[order-bot] Logging in…')
    await page.goto(`${BASE}/index.php?route=account/login`, { waitUntil: 'domcontentloaded' })
    await page.fill('#input-email',    email)
    await page.fill('#input-password', password)
    await page.click('input[type="submit"]')
    await page.waitForURL(/route=account\/account/, { timeout: 15_000 })
    console.log('[order-bot] Logged in')

    // ── 2. Clear existing cart ────────────────────────────────────────────────
    await page.goto(`${BASE}/index.php?route=checkout/cart`, { waitUntil: 'domcontentloaded' })
    const removeButtons = page.locator('button[data-original-title="Remove"]')
    const count = await removeButtons.count()
    for (let i = 0; i < count; i++) {
      await removeButtons.first().click()
      await page.waitForTimeout(500)
    }

    // ── 3. Add items to cart ─────────────────────────────────────────────────
    for (const item of itemsWithUrl) {
      console.log(`[order-bot] Adding to cart: ${item.name} × ${item.quantity}`)
      await page.goto(item.padelpoint_url!, { waitUntil: 'domcontentloaded' })

      // Set quantity if field exists (default = 1)
      const qtyInput = page.locator('#input-quantity')
      if (await qtyInput.isVisible()) {
        await qtyInput.fill(String(item.quantity))
      }

      // Add to cart
      const addBtn = page.locator('#button-cart')
      await addBtn.click()

      // Wait for cart update (success alert or cart count change)
      await page.waitForTimeout(1_500)

      // Check for stock error in the alert
      const alert = page.locator('.alert-danger')
      if (await alert.isVisible()) {
        const msg = await alert.innerText()
        throw new Error(`Add to cart failed for "${item.name}": ${msg.trim()}`)
      }
    }

    // ── 4. Checkout ──────────────────────────────────────────────────────────
    console.log('[order-bot] Proceeding to checkout…')
    await page.goto(`${BASE}/index.php?route=checkout/checkout`, { waitUntil: 'domcontentloaded' })

    // Returning customer — skip step 1 (already logged in)
    // Step 2: Billing address — use existing / default
    const billingContinue = page.locator('#button-payment-address')
    if (await billingContinue.isVisible({ timeout: 5_000 })) {
      await billingContinue.click()
      await page.waitForTimeout(1_000)
    }

    // Step 3: Delivery address
    const deliveryContinue = page.locator('#button-shipping-address')
    if (await deliveryContinue.isVisible({ timeout: 5_000 })) {
      await deliveryContinue.click()
      await page.waitForTimeout(1_000)
    }

    // Step 4: Delivery method — pick first available shipping option
    const shippingContinue = page.locator('#button-shipping-method')
    if (await shippingContinue.isVisible({ timeout: 5_000 })) {
      // Select the first shipping radio if not already selected
      const firstRadio = page.locator('input[name="shipping_method"]').first()
      if (await firstRadio.isVisible()) await firstRadio.check()
      await shippingContinue.click()
      await page.waitForTimeout(1_000)
    }

    // Step 5: Payment method — prefer account credit / balance
    const paymentContinue = page.locator('#button-payment-method')
    if (await paymentContinue.isVisible({ timeout: 5_000 })) {
      // Try to select "account credit" or "free" payment option
      const creditOption = page.locator(
        'input[name="payment_method"][value*="account"], input[name="payment_method"][value*="credit"], input[name="payment_method"][value*="free"]',
      )
      if (await creditOption.first().isVisible()) {
        await creditOption.first().check()
      } else {
        // Fall back to first available payment method
        await page.locator('input[name="payment_method"]').first().check()
      }
      await paymentContinue.click()
      await page.waitForTimeout(1_000)
    }

    // Step 6: Confirm order
    const confirmBtn = page.locator('#button-confirm')
    await confirmBtn.waitFor({ timeout: 10_000 })
    await confirmBtn.click()

    // Wait for success page
    await page.waitForURL(/route=checkout\/success/, { timeout: 30_000 })
    console.log('[order-bot] Order placed successfully!')

    // ── 5. Mark order status ─────────────────────────────────────────────────
    await markOrderStatus(orderId, 'auto_ordered')
    await logAutomation(orderId, 'success')

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[order-bot] FAILED:', errMsg)

    screenshot = await page.screenshot({ type: 'png' }).catch(() => undefined)

    await sendFailureAlert(orderId, errMsg, screenshot)
    await markOrderStatus(orderId, 'auto_order_failed')
    await logAutomation(orderId, 'failed', errMsg)

    process.exit(1)
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('[order-bot] Unhandled error:', err)
  process.exit(1)
})
