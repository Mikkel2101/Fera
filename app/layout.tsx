import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://ferabrand.com'),
  title: {
    default: 'Fera Padel — Reiser og utstyr',
    template: '%s — Fera Padel',
  },
  description: 'Profesjonelle padelreiser til Spania og premium padelutstyr fra Padelpoint. Alt på ett sted.',
  openGraph: {
    title: 'Fera Padel',
    description: 'Profesjonelle padelreiser til Spania og premium padelutstyr fra Padelpoint.',
    url: 'https://ferabrand.com',
    siteName: 'Fera Padel',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fera Padel',
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

const hankenGrotesk = localFont({
  src: [
    { path: '../public/fonts/static/static/HankenGrotesk-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/static/static/HankenGrotesk-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/static/static/HankenGrotesk-SemiBold.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-hanken-grotesk',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${playfair.variable} ${hankenGrotesk.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
