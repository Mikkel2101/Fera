export type PadelpointOrderItem = {
  product_id:     string
  name:           string
  quantity:       number
  price_eur:      number
  padelpoint_url: string | null
}

export type PadelpointOrderPayload = {
  order_id: string
  items:    PadelpointOrderItem[]
}

export async function triggerPadelpointOrder(payload: PadelpointOrderPayload): Promise<void> {
  const token = process.env.FERAGIT_DISPATCH_TOKEN
  const owner = process.env.FERAGIT_OWNER
  const repo  = process.env.FERAGIT_REPO

  if (!token || !owner || !repo) {
    console.warn('[github-dispatch] env vars missing — skipping auto-order for', payload.order_id)
    return
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Accept':               'application/vnd.github+json',
        'Authorization':        `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type':         'application/json',
      },
      body: JSON.stringify({
        event_type:     'padelpoint-order',
        client_payload: payload,
      }),
    },
  )

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`[github-dispatch] ${res.status}: ${text}`)
  }
}
