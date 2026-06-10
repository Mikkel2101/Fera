import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, navn, epost, telefon, melding, ...rest } = body

    if (!navn || !epost) {
      return NextResponse.json({ error: 'Navn og e-post er påkrevd' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(epost)) {
      return NextResponse.json({ error: 'Ugyldig e-postadresse' }, { status: 400 })
    }

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('contact_submissions').insert({
      type: type ?? 'general',
      navn,
      epost,
      telefon: telefon ?? null,
      melding: melding ?? null,
      extra_data: Object.keys(rest).length > 0 ? rest : null,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
