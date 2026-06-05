import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'

export const metadata: Metadata = { title: 'Fera Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/?error=not_authenticated')

  const role = user.app_metadata?.role
  if (role !== 'admin') redirect('/?error=not_authorized')

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
