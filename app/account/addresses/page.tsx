import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AddressList from './_components/AddressForm'

export const metadata: Metadata = { title: 'Adresser' }

export default async function AddressesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // addresses-tabellen eksisterer etter at migration 017 er kjørt i Supabase-dashbordet
  const { data: addresses } = await supabase
    .from('addresses')
    .select('id, label, full_name, address1, address2, postal_code, city, country, is_default')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-(--color-text)">Leveringsadresser</h1>
        <p className="mt-1 text-sm text-(--color-muted)">
          Lagrede adresser for raskere checkout.
        </p>
      </div>

      <AddressList addresses={addresses ?? []} />
    </div>
  )
}
