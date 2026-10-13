import { describe, it, expect } from 'vitest'
import { parseSubscribeRequest, addList } from '@/lib/newsletter/subscribe'

describe('parseSubscribeRequest', () => {
  it('legger e-post uten liste på det vanlige nyhetsbrevet', () => {
    expect(parseSubscribeRequest({ email: 'ida@fera.no' })).toEqual({
      ok: true, email: 'ida@fera.no', list: 'nyhetsbrev',
    })
  })

  it('godtar kjent liste', () => {
    expect(parseSubscribeRequest({ email: 'ida@fera.no', list: 'kolleksjon' })).toEqual({
      ok: true, email: 'ida@fera.no', list: 'kolleksjon',
    })
  })

  it('normaliserer e-post til små bokstaver uten mellomrom', () => {
    const result = parseSubscribeRequest({ email: '  Ida@Fera.NO ' })
    expect(result).toEqual({ ok: true, email: 'ida@fera.no', list: 'nyhetsbrev' })
  })

  it('avviser ugyldig e-post', () => {
    expect(parseSubscribeRequest({ email: 'ikke-epost' })).toEqual({
      ok: false, error: 'Ugyldig e-postadresse',
    })
  })

  it('avviser ukjent liste', () => {
    expect(parseSubscribeRequest({ email: 'ida@fera.no', list: 'hacker' })).toEqual({
      ok: false, error: 'Ukjent liste',
    })
  })

  it('avviser body som ikke er et objekt', () => {
    expect(parseSubscribeRequest(null)).toEqual({ ok: false, error: 'Ugyldig e-postadresse' })
  })
})

describe('addList', () => {
  it('legger til liste uten å endre originalen', () => {
    const existing = ['travels']
    const result = addList(existing, 'kolleksjon')
    expect(result).toEqual(['travels', 'kolleksjon'])
    expect(existing).toEqual(['travels'])
  })

  it('dupliserer ikke en liste som allerede finnes', () => {
    expect(addList(['kolleksjon'], 'kolleksjon')).toEqual(['kolleksjon'])
  })
})
