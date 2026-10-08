import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/auth/next-path'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNextPath(searchParams.get('next'))

  const origin = request.headers.get('origin') ?? request.nextUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/logg-inn?error=missing_code&next=${encodeURIComponent(next)}`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('Auth callback error:', error?.message)
    return NextResponse.redirect(`${origin}/logg-inn?error=auth_failed&next=${encodeURIComponent(next)}`)
  }

  await supabase.from('users').upsert(
    {
      id: data.user.id,
      full_name: data.user.user_metadata?.full_name ?? null,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  return NextResponse.redirect(`${origin}${next}`)
}
