'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body style={{ fontFamily: 'sans-serif', background: '#FFFFFF', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>😕</p>
          <h1 style={{ fontSize: '24px', color: '#420016', margin: '0 0 8px' }}>Noe gikk galt</h1>
          <p style={{ color: '#9B7888', margin: '0 0 24px' }}>Vi beklager — en uventet feil oppstod.</p>
          <button
            onClick={reset}
            style={{ background: '#420016', color: '#fff', border: 'none', borderRadius: '9999px', padding: '12px 24px', fontFamily: 'sans-serif', fontWeight: '600', cursor: 'pointer' }}
          >
            Prøv igjen
          </button>
        </div>
      </body>
    </html>
  )
}
