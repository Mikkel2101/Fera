import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './_components/ProfileForm'

export const metadata: Metadata = { title: 'Profil' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, phone, padel_level, newsletter_consent')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-(--color-text)">Profil</h1>
        <p className="mt-1 text-sm text-(--color-muted)">Oppdater navn, telefon og preferanser.</p>
      </div>

      {/* E-post (read-only — styres av Supabase Auth) */}
      <div className="rounded-2xl border border-(--color-border) bg-(--color-sand-light) px-5 py-4">
        <p className="text-xs font-medium text-(--color-muted) uppercase tracking-wider mb-1">E-post</p>
        <p className="text-sm font-medium text-(--color-text)">{user.email}</p>
        <p className="text-xs text-(--color-muted) mt-1">E-postadressen kan ikke endres herfra.</p>
      </div>

      <ProfileForm
        initial={{
          full_name:          profile?.full_name          ?? null,
          phone:              profile?.phone              ?? null,
          padel_level:        profile?.padel_level        ?? null,
          newsletter_consent: profile?.newsletter_consent ?? false,
        }}
      />
    </div>
  )
}
