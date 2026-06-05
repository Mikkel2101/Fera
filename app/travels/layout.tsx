import type { Metadata } from 'next'
import Nav from '@/components/travels/Nav'

export const metadata: Metadata = {
  title: 'Fera Travels — Padel-reiser til Costa Blanca',
  description: 'Kurerte padel-reisepakker til Spania for norske padel-entusiaster.',
}

export default function TravelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
    </>
  )
}
