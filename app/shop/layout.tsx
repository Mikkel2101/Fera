import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fera Shop — Padel-utstyr fra Spania',
  description: 'Norges beste utvalg av padel-utstyr, direkte fra Spania.',
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
