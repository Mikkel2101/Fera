import { describe, it, expect } from 'vitest'
import { isOpenDuringComingSoon } from '@/lib/routing/coming-soon'

describe('isOpenDuringComingSoon', () => {
  it.each([
    '/nyhetsbrev/avmeld',
    '/api/nyhetsbrev/avmeld',
    '/admin',
    '/admin/articles/1',
    '/api/supabase/rest/v1/articles',
    '/api/auth/callback',
    '/api/webhooks/stripe',
    '/_next/static/chunk.js',
    '/Hero.png',
  ])('slipper gjennom %s', (path) => {
    expect(isOpenDuringComingSoon(path, 'ferapadel.com')).toBe(true)
  })

  it.each(['/', '/travels', '/travels/inspirasjon', '/api/newsletter', '/nyhetsbrevfoo', '/no', '/kolleksjon'])(
    'stenger %s', (path) => {
      expect(isOpenDuringComingSoon(path, 'ferapadel.com')).toBe(false)
    },
  )

  it('slipper gjennom alt på admin.-domenet', () => {
    expect(isOpenDuringComingSoon('/', 'admin.ferapadel.com')).toBe(true)
  })
})
