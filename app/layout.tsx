import { Playfair_Display } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

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
