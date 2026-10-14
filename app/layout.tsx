import type { Metadata } from 'next'
import { Playfair_Display, Archivo } from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://ferabrand.com'),
  title: {
    default: 'FERA Padel — Reiser og utstyr',
    template: '%s — FERA Padel',
  },
  description: 'Profesjonelle padelreiser til Spania og premium padelutstyr fra Padelpoint. Alt på ett sted.',
  openGraph: {
    title: 'FERA Padel',
    description: 'Profesjonelle padelreiser til Spania og premium padelutstyr fra Padelpoint.',
    url: 'https://ferabrand.com',
    siteName: 'FERA Padel',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FERA Padel',
    description: 'Profesjonelle padelreiser til Spania og premium padelutstyr fra Padelpoint.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['100', '400'],
  variable: '--font-archivo',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${playfair.variable} ${archivo.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
