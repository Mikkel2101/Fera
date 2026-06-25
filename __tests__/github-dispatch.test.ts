import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { triggerPadelpointOrder } from '@/lib/shop/github'

const PAYLOAD = {
  order_id: 'order-123',
  items: [
    {
      product_id: 'prod-1',
      name: 'Bullpadel Hack 03',
      quantity: 2,
      price_eur: 199,
      padelpoint_url: 'https://www.tiendapadelpoint.com/p/hack-03',
    },
  ],
}

describe('triggerPadelpointOrder', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('does nothing and logs when env vars are missing', async () => {
    delete process.env.GITHUB_DISPATCH_TOKEN
    delete process.env.GITHUB_OWNER
    delete process.env.GITHUB_REPO

    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchSpy = vi.spyOn(global, 'fetch')

    await triggerPadelpointOrder(PAYLOAD)

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalledOnce()
  })

  it('calls GitHub API with correct body', async () => {
    process.env.GITHUB_DISPATCH_TOKEN = 'tok-abc'
    process.env.GITHUB_OWNER = 'ferabrand'
    process.env.GITHUB_REPO = 'fera'

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 }),
    )

    await triggerPadelpointOrder(PAYLOAD)

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.github.com/repos/ferabrand/fera/dispatches')

    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.event_type).toBe('padelpoint-order')
    expect(body.client_payload.order_id).toBe('order-123')
    expect(body.client_payload.items).toHaveLength(1)
  })

  it('sends correct Authorization header', async () => {
    process.env.GITHUB_DISPATCH_TOKEN = 'tok-abc'
    process.env.GITHUB_OWNER = 'ferabrand'
    process.env.GITHUB_REPO = 'fera'

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 }),
    )

    await triggerPadelpointOrder(PAYLOAD)

    const [, init] = fetchSpy.mock.calls[0]
    const headers = (init as RequestInit).headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer tok-abc')
  })

  it('throws on non-2xx GitHub response', async () => {
    process.env.GITHUB_DISPATCH_TOKEN = 'tok-bad'
    process.env.GITHUB_OWNER = 'ferabrand'
    process.env.GITHUB_REPO = 'fera'

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Unauthorized', { status: 401 }),
    )

    await expect(triggerPadelpointOrder(PAYLOAD)).rejects.toThrow('401')
  })
})
