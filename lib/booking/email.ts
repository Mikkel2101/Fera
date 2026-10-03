import { Resend } from 'resend'

// Lazy init — Resend kaster ved tom nøkkel på modulnivå; instansier ved sending.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? '')
}

const OPS_EMAIL  = process.env.OPS_EMAIL ?? 'post@ferabrand.com'
const FROM_EMAIL = 'Fera Padel <post@ferabrand.com>'

export type ReservationEmailPayload = {
  booking_id:      string
  first_name:      string
  last_name:       string
  email:           string
  phone:           string | null
  padel_level:     string | null
  room_type:       string
  roommate_name:   string | null
  selected_extras: string[]
  trip: {
    id:          string
    name:        string
    destination: string
    start_date:  string
    end_date:    string
  }
}

const ROOM_LABELS: Record<string, string> = {
  Dobbel: 'Dobbeltrom',
  Single: 'Enkeltrom',
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function detailRows(p: ReservationEmailPayload): string {
  const rows: Array<[string, string]> = [
    ['Tur',     p.trip.name],
    ['Sted',    p.trip.destination],
    ['Datoer',  `${formatDate(p.trip.start_date)} – ${formatDate(p.trip.end_date)}`],
    ['Romtype', ROOM_LABELS[p.room_type] ?? p.room_type],
  ]
  if (p.roommate_name) rows.push(['Deler rom med', p.roommate_name])
  if (p.selected_extras.length > 0) rows.push(['Tilvalg', p.selected_extras.join(', ')])

  return rows
    .map(([label, value]) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #EDD8C8;color:#9B7888;">${label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #EDD8C8;">${escapeHtml(value)}</td>
      </tr>`)
    .join('')
}

export async function sendReservationConfirmation(p: ReservationEmailPayload): Promise<void> {
  const shortId = p.booking_id.slice(0, 8).toUpperCase()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1C0008;">
      <div style="background:#420016;padding:24px;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Fera Padel</h1>
        <p style="color:#FFE1B0;margin:4px 0 0;font-size:14px;">Reservasjon #${shortId}</p>
      </div>

      <div style="padding:32px 24px;">
        <h2 style="margin:0 0 8px;font-size:18px;">Plassen er reservert, ${escapeHtml(p.first_name)}!</h2>
        <p style="color:#7A5868;margin:0 0 24px;">
          Vi holder av en plass til deg på turen. Reservasjonen er uforpliktende —
          vi tar kontakt med betalingsinformasjon før påmeldingen blir bindende.
        </p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
          <tbody>${detailRows(p)}</tbody>
        </table>

        <p style="margin:0 0 24px;">
          <a href="${baseUrl}/account/trips" style="color:#420016;font-weight:600;">Se reservasjonen under «Mine reiser»</a>
        </p>

        <p style="font-size:13px;color:#9B7888;margin:0;">
          Ombestemt deg, eller har du spørsmål? Svar på denne e-posten eller skriv til
          <a href="mailto:post@ferabrand.com" style="color:#420016;">post@ferabrand.com</a>.
        </p>
      </div>

      <div style="background:#f5f0ee;padding:16px 24px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9B7888;">Fera Padel · post@ferabrand.com</p>
      </div>
    </div>
  `

  const { error } = await getResend().emails.send({
    from:    FROM_EMAIL,
    to:      p.email,
    replyTo: OPS_EMAIL,
    subject: `Plassen er reservert: ${p.trip.name} — Fera Padel`,
    html,
  })

  if (error) {
    throw new Error(`Resend reservasjonsbekreftelse feil: ${JSON.stringify(error)}`)
  }
}

export async function sendOpsReservationEmail(p: ReservationEmailPayload): Promise<void> {
  const contactRows: Array<[string, string]> = [
    ['Navn',      `${p.first_name} ${p.last_name}`],
    ['E-post',    p.email],
    ['Telefon',   p.phone ?? '—'],
    ['Padelnivå', p.padel_level ?? '—'],
  ]

  const html = `
    <div style="font-family:sans-serif;max-width:600px;color:#1C0008;">
      <h2 style="margin:0 0 16px;">Ny reservasjon: ${escapeHtml(p.trip.name)}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
        <tbody>
          ${contactRows.map(([label, value]) =>
            `<tr>
              <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#9B7888;">${label}</td>
              <td style="padding:6px 12px;border-bottom:1px solid #eee;">${escapeHtml(value)}</td>
            </tr>`).join('')}
          ${detailRows(p)}
        </tbody>
      </table>
      <p style="font-size:12px;color:#9B7888;">Booking-ID: ${p.booking_id}</p>
    </div>
  `

  const { error } = await getResend().emails.send({
    from:    FROM_EMAIL,
    to:      OPS_EMAIL,
    replyTo: p.email,
    subject: `Ny reservasjon — ${p.first_name} ${p.last_name} — ${p.trip.name}`,
    html,
  })

  if (error) {
    throw new Error(`Resend ops-reservasjon feil: ${JSON.stringify(error)}`)
  }
}
