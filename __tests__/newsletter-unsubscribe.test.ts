import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { unsubscribe } from '@/lib/newsletter/unsubscribe'
import { unsubscribeLinks } from '@/lib/newsletter/token'

const SECRET = 'k'.repeat(40)
const link = unsubscribeLinks('Ola@Example.no', SECRET, 'https://ferapadel.com')
const params = new URL(link.oneClick).searchParams
const e = params.get('e')
const t = params.get('t')

describe('unsubscribe', () => {
  it('melder av e-posten i små bokstaver når lenken er gyldig', async () => {
    const remove = vi.fn(async () => true)
    expect(await unsubscribe(e, t, { secret: SECRET, remove })).toBe('ok')
    expect(remove).toHaveBeenCalledWith('ola@example.no')
  })

  it('avviser ugyldig lenke uten å røre databasen', async () => {
    const remove = vi.fn(async () => true)
    expect(await unsubscribe(e, 'feil', { secret: SECRET, remove })).toBe('invalid')
    expect(await unsubscribe(null, null, { secret: SECRET, remove })).toBe('invalid')
    expect(remove).not.toHaveBeenCalled()
  })

  it('gir feil (ikke «ugyldig») når hemmeligheten mangler på serveren', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const remove = vi.fn(async () => true)
    expect(await unsubscribe(e, t, { secret: null, remove })).toBe('error')
    expect(remove).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('gir feil når databasen feiler', async () => {
    expect(await unsubscribe(e, t, { secret: SECRET, remove: async () => false })).toBe('error')
  })

  it('gir feil (kaster ikke) når databasekallet kaster', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const remove = async () => { throw new Error('supabaseKey is required') }
    expect(await unsubscribe(e, t, { secret: SECRET, remove })).toBe('error')
    spy.mockRestore()
  })
})

describe('POST /api/nyhetsbrev/avmeld (one-click)', () => {
  const remove = vi.fn<(call: string) => Promise<boolean>>(async () => true)

  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('NEWSLETTER_UNSUBSCRIBE_SECRET', SECRET)
    vi.doMock('@/lib/supabase/service', () => ({
      createServiceClient: () => ({
        rpc: async (name: string, args: { p_email: string }) => {
          await remove(`${name}:${args.p_email}`)
          return { error: null }
        },
      }),
    }))
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.doUnmock('@/lib/supabase/service')
    remove.mockClear()
  })

  it('svarer 200 og melder av ved gyldig lenke', async () => {
    const { POST } = await import('@/app/api/nyhetsbrev/avmeld/route')
    const response = await POST(new NextRequest(link.oneClick, { method: 'POST', body: 'List-Unsubscribe=One-Click' }))
    expect(response.status).toBe(200)
    expect(remove).toHaveBeenCalledWith('newsletter_unsubscribe:ola@example.no')
  })

  it('svarer 400 ved ugyldig lenke', async () => {
    const { POST } = await import('@/app/api/nyhetsbrev/avmeld/route')
    const response = await POST(new NextRequest('https://ferapadel.com/api/nyhetsbrev/avmeld?e=x&t=y', { method: 'POST' }))
    expect(response.status).toBe(400)
    expect(remove).not.toHaveBeenCalled()
  })

  it('sender GET videre til bekreftelsessiden uten å melde av', async () => {
    const { GET } = await import('@/app/api/nyhetsbrev/avmeld/route')
    const response = await GET(new NextRequest(link.oneClick))
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(link.page)
    expect(remove).not.toHaveBeenCalled()
  })
})
