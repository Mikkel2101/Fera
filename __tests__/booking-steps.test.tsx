import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Step1PersonInfo from '@/components/booking/Step1PersonInfo'
import Step2RoomExtras from '@/components/booking/Step2RoomExtras'
import { parseTripExtras } from '@/lib/booking/extras'
import type { BookingTrip } from '@/components/booking/BookingShell'

afterEach(cleanup)

const trip: BookingTrip = {
  id:               '00000000-0000-4000-8000-000000000001',
  title:            'Costa Blanca Camp',
  deposit_eur:      500,
  price_double_eur: 1500,
  price_single_eur: 1800,
  extras:           parseTripExtras([{ name: 'FERA-t-skjorte', price_eur: 10, sizes: ['S', 'M'], max_quantity: 3 }]),
}

describe('Step1PersonInfo', () => {
  const prefill = { first_name: 'Kari', last_name: 'Nordmann', email: 'kari@example.com' }

  it('stopper uten telefon og padelnivå', () => {
    const onNext = vi.fn()
    render(<Step1PersonInfo data={prefill} lockedEmail="kari@example.com" onNext={onNext} />)

    fireEvent.click(screen.getByRole('button', { name: /Neste/ }))

    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByText('Velg padelnivå')).toBeTruthy()
    expect(screen.getByText(/Skriv inn mobilnummer med landskode/)).toBeTruthy()
  })

  it('sender normalisert telefon og valgt nivå videre', () => {
    const onNext = vi.fn()
    render(<Step1PersonInfo data={prefill} lockedEmail="kari@example.com" onNext={onNext} />)

    fireEvent.change(screen.getByLabelText(/Mobilnummer/), { target: { value: '912 34 567' } })
    fireEvent.click(screen.getByRole('radio', { name: /Middels \+/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Høyre' }))
    fireEvent.click(screen.getByRole('button', { name: 'Det sosiale' }))
    fireEvent.click(screen.getByRole('button', { name: /Neste/ }))

    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({
      phone: '+4791234567', padel_level: 'middels_pluss', preferred_side: 'hoyre', trip_goal: 'sosialt',
    }))
  })
})

describe('Step2RoomExtras', () => {
  function renderStep2() {
    const onNext = vi.fn()
    render(<Step2RoomExtras trip={trip} data={{ extras: [] }} onBack={vi.fn()} onNext={onNext} />)
    return onNext
  }

  it('krever et aktivt romvalg', () => {
    const onNext = renderStep2()
    fireEvent.click(screen.getByRole('button', { name: /Neste/ }))
    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByText('Velg romønske')).toBeTruthy()
  })

  it('krever navn når kunden deler med en reisepartner', () => {
    const onNext = renderStep2()
    fireEvent.click(screen.getByRole('radio', { name: /bestemt reisepartner/ }))
    fireEvent.click(screen.getByRole('button', { name: /Neste/ }))
    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByText('Skriv navnet på reisepartneren din')).toBeTruthy()
  })

  it('viser enkeltromstillegg, depositum og restbeløp', () => {
    renderStep2()
    fireEvent.click(screen.getByRole('radio', { name: /enkeltrom/ }))
    expect(screen.getByText('Enkeltromstillegg')).toBeTruthy()
    expect(screen.getByText('1800 EUR')).toBeTruthy()
    expect(screen.getByText('1300 EUR')).toBeTruthy()
  })

  it('krever størrelse på klær før kunden går videre', () => {
    const onNext = renderStep2()
    fireEvent.click(screen.getByRole('radio', { name: /enkeltrom/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /FERA-t-skjorte/ }))
    fireEvent.click(screen.getByRole('button', { name: /Neste/ }))
    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByText('Velg størrelse for FERA-t-skjorte')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Størrelse'), { target: { value: 'M' } })
    fireEvent.change(screen.getByLabelText('Antall'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: /Neste/ }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({
      room_preference: 'single',
      extras:          [{ name: 'FERA-t-skjorte', size: 'M', quantity: 2 }],
    }))
  })
})
