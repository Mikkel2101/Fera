import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { parseSubscribeRequest, addList, type NewsletterList } from '@/lib/newsletter/subscribe'

const UNIQUE_VIOLATION = '23505'

// Eksisterende abonnent som melder seg på en liste (f.eks. kolleksjon-lanseringen).
// Anon-rollen kan bare inserte, så oppdateringen går via service role.
async function addListToExisting(email: string, list: NewsletterList): Promise<boolean> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('newsletter_subscribers')
    .select('brands')
    .eq('email', email)
    .single()
  if (error || !data) {
    console.error('newsletter: kunne ikke lese eksisterende abonnent', error)
    return false
  }

  const { error: updateError } = await service
    .from('newsletter_subscribers')
    .update({ brands: addList(data.brands, list) })
    .eq('email', email)
  if (updateError) {
    console.error('newsletter: kunne ikke legge til liste', updateError)
    return false
  }
  return true
}

export async function POST(request: NextRequest) {
  try {
    const parsed = parseSubscribeRequest(await request.json())
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const { email, list } = parsed

    const supabase = await createClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, brands: list ? [list] : [] })

    if (error?.code === UNIQUE_VIOLATION) {
      if (list && !(await addListToExisting(email, list))) {
        return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
      }
      return NextResponse.json({ success: true, already: true })
    }
    if (error) {
      console.error('newsletter: insert feilet', error)
      return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
