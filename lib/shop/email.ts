import { Resend } from 'resend'
import type { CartItemData } from './schema'

// Lazy init — Resend kaster ved tom nøkkel på modulnivå; instansier ved sending.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? '')
}

const OPS_EMAIL  = process.env.OPS_EMAIL ?? 'post@ferabrand.com'
const FROM_EMAIL = 'Fera Padel <post@ferabrand.com>'

export type OpsOrderPayload = {
  order_id:    string
  first_name:  string
  last_name:   string
  email:       string
  phone?:      string
  items:       CartItemData[]
  total_eur:   number
  shipping_address?: {
    name?:        string | null
    line1?:       string | null
    line2?:       string | null
    city?:        string | null
    postal_code?: string | null
    country?:     string | null
  } | null
}

function buildOrderRows(items: CartItemData[]): string {
  return items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${i.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${i.brand}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">€ ${(i.price_eur * i.quantity).toFixed(2)}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">
            ${i.padelpoint_url ? `<a href="${i.padelpoint_url}" style="color:#7C0023;">Se produkt</a>` : '—'}
          </td>
        </tr>`,
    )
    .join('')
}

export type CustomerOrderPayload = {
  order_id:    string
  first_name:  string
  last_name:   string
  email:       string
  items:       CartItemData[]
  total_nok:   number
  shipping_address?: {
    name?:        string | null
    line1?:       string | null
    line2?:       string | null
    city?:        string | null
    postal_code?: string | null
    country?:     string | null
  } | null
}

export async function sendCustomerOrderConfirmation(payload: CustomerOrderPayload): Promise<void> {
  const shortId = payload.order_id.slice(0, 8).toUpperCase()
  const addr = payload.shipping_address
  const addressLines = addr
    ? [addr.name, addr.line1, addr.line2, `${addr.postal_code ?? ''} ${addr.city ?? ''}`.trim(), addr.country]
        .filter(Boolean)
        .join('<br>')
    : '—'

  const itemRows = payload.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #EDD8C8;">${i.quantity} × ${i.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #EDD8C8;color:#9B7888;">${i.brand}</td>
        </tr>`,
    )
    .join('')

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1C0008;">
      <div style="background:#420016;padding:24px;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Fera Padel</h1>
        <p style="color:#FFE1B0;margin:4px 0 0;font-size:14px;">Ordrebekreftelse #${shortId}</p>
      </div>

      <div style="padding:32px 24px;">
        <h2 style="margin:0 0 8px;font-size:18px;">Takk for bestillingen, ${payload.first_name}!</h2>
        <p style="color:#7A5868;margin:0 0 24px;">
          Vi har mottatt ordren din og behandler den nå.
          Du vil motta en ny e-post når varen er sendt.
        </p>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#7C0023;margin:0 0 8px;">Produkter</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
          <tbody>${itemRows}</tbody>
        </table>

        <p style="font-size:16px;font-weight:700;margin:0 0 24px;">
          Totalt betalt: kr ${payload.total_nok.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        </p>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#7C0023;margin:0 0 8px;">Leveringsadresse</h3>
        <p style="margin:0 0 24px;">${addressLines}</p>

        <div style="background:#FFF8F0;border:1px solid #EDD8C8;border-radius:8px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#7A5868;line-height:1.6;">
            <strong>Estimert leveringstid:</strong> 5–7 virkedager (fra Spania via UPS).<br>
            <strong>Merk:</strong> Toll og mva. (25 %) betales til UPS ved levering.<br>
            <strong>14 dagers angrerett</strong> — kontakt oss på
            <a href="mailto:post@ferabrand.com" style="color:#420016;">post@ferabrand.com</a>
            for retur.
          </p>
        </div>

        <p style="font-size:13px;color:#9B7888;margin:0;">
          Ordre-ID: ${payload.order_id}<br>
          Spørsmål? Send e-post til
          <a href="mailto:post@ferabrand.com" style="color:#420016;">post@ferabrand.com</a>
        </p>
      </div>

      <div style="background:#f5f0ee;padding:16px 24px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9B7888;">
          Fera Padel · post@ferabrand.com
        </p>
      </div>
    </div>
  `

  const { error } = await getResend().emails.send({
    from:    FROM_EMAIL,
    to:      payload.email,
    subject: `Ordrebekreftelse #${shortId} — Fera Padel`,
    html,
  })

  if (error) {
    throw new Error(`Resend customer email feil: ${JSON.stringify(error)}`)
  }
}

export async function sendOpsOrderEmail(payload: OpsOrderPayload): Promise<void> {
  const addr = payload.shipping_address
  const addressLines = addr
    ? [addr.name, addr.line1, addr.line2, `${addr.postal_code ?? ''} ${addr.city ?? ''}`.trim(), addr.country]
        .filter(Boolean)
        .join('<br>')
    : '— (ikke mottatt fra Stripe ennå)'

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1C0008;">
      <h1 style="background:#420016;color:#fff;padding:16px 24px;margin:0;font-size:18px;">
        Ny ordre #${payload.order_id.slice(0, 8).toUpperCase()} — bestill hos Padelpoint
      </h1>

      <div style="padding:24px;">
        <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#7C0023;margin-bottom:8px;">Kunde</h2>
        <p style="margin:0 0 4px;">
          <strong>${payload.first_name} ${payload.last_name}</strong><br>
          ${payload.email}${payload.phone ? `<br>${payload.phone}` : ''}
        </p>

        <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#7C0023;margin:20px 0 8px;">Leveringsadresse</h2>
        <p style="margin:0;">${addressLines}</p>

        <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#7C0023;margin:20px 0 8px;">Produkter</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f5f0ee;">
              <th style="padding:6px 12px;text-align:left;">Produkt</th>
              <th style="padding:6px 12px;text-align:left;">Brand</th>
              <th style="padding:6px 12px;text-align:center;">Antall</th>
              <th style="padding:6px 12px;text-align:right;">Pris</th>
              <th style="padding:6px 12px;text-align:left;">Padelpoint-lenke</th>
            </tr>
          </thead>
          <tbody>
            ${buildOrderRows(payload.items)}
          </tbody>
        </table>

        <p style="margin:16px 0 0;font-size:15px;">
          <strong>Totalt betalt: € ${payload.total_eur.toFixed(2)}</strong>
          <span style="color:#9B7888;font-size:12px;"> (+ €20 frakt, gratis over €200)</span>
        </p>

        <div style="background:#FFF8F0;border:1px solid #EDD8C8;border-radius:8px;padding:16px;margin-top:24px;">
          <p style="margin:0;font-size:13px;color:#7A5868;">
            <strong>Handling kreves:</strong> Logg inn på
            <a href="https://www.racketstore.com" style="color:#420016;">racketstore.com</a>
            (eller tiendapadelpoint.com) med wholesale-kontoen og legg inn ordren manuelt.
            Bruk produktlenkene over for å finne varene raskt.<br><br>
            <strong>Ordre-ID:</strong> ${payload.order_id}
          </p>
        </div>
      </div>
    </div>
  `

  const { error } = await getResend().emails.send({
    from:    FROM_EMAIL,
    to:      OPS_EMAIL,
    subject: `Ny Fera Shop-ordre: ${payload.first_name} ${payload.last_name} — € ${payload.total_eur.toFixed(2)}`,
    html,
  })

  if (error) {
    throw new Error(`Resend feil: ${JSON.stringify(error)}`)
  }
}
