'use client'

import { useState } from 'react'
import { step2Schema } from '@/lib/booking/schema'
import type { Step2Data } from '@/lib/booking/schema'

type Extra = { name: string; price_eur: number }

type Props = {
  trip: {
    extras: Extra[]
    deposit_eur: number
    price_double_eur: number
    price_single_eur: number
  }
  data: Partial<Step2Data>
  onBack: () => void
  onNext: (data: Step2Data) => void
}

export default function Step2RoomExtras({ trip, data, onBack, onNext }: Props) {
  const [roomType, setRoomType] = useState<'Dobbel' | 'Single'>(data.room_type ?? 'Dobbel')
  const [roommateName, setRoommateName] = useState(data.roommate_name ?? '')
  const [selectedExtras, setSelectedExtras] = useState<string[]>(data.selected_extras ?? [])

  function toggleExtra(name: string) {
    setSelectedExtras(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    )
  }

  function handleSubmit() {
    const parsed = step2Schema.parse({
      room_type: roomType,
      roommate_name: roommateName || undefined,
      selected_extras: selectedExtras,
    })
    onNext(parsed)
  }

  const extrasTotal = selectedExtras.reduce((sum, name) => {
    const extra = trip.extras.find(e => e.name === name)
    return sum + (extra?.price_eur ?? 0)
  }, 0)
  const totalDeposit = trip.deposit_eur + extrasTotal

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-display font-semibold text-[--color-text] mt-6">
        Rom & tilvalg
      </h2>

      {/* Romtype */}
      <div>
        <p className="text-sm font-medium text-[--color-text] mb-3">Romtype</p>
        <div className="space-y-3">
          {([
            { value: 'Dobbel', label: 'Dobbeltrom', price: trip.price_double_eur },
            { value: 'Single', label: 'Enkeltrom',  price: trip.price_single_eur },
          ] as const).map(({ value, label, price }) => (
            <label
              key={value}
              className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition-colors
                ${roomType === value
                  ? 'border-[--color-cta] bg-orange-50'
                  : 'border-[--color-border] hover:border-[--color-muted]'
                }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="room_type"
                  value={value}
                  checked={roomType === value}
                  onChange={() => setRoomType(value)}
                  className="accent-[--color-cta]"
                />
                <span className="font-medium text-[--color-text]">{label}</span>
              </div>
              <span className="text-[--color-muted]">{price} EUR</span>
            </label>
          ))}
        </div>

        {roomType === 'Dobbel' && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-[--color-text] mb-1">
              Hvem deler du rom med?
            </label>
            <input
              type="text"
              value={roommateName}
              onChange={e => setRoommateName(e.target.value)}
              placeholder="Navn (valgfritt)"
              className="border border-[--color-border] rounded-lg px-4 py-3 w-full focus:outline-none focus:border-[--color-cta]"
            />
          </div>
        )}
      </div>

      {/* Tilvalg */}
      {trip.extras.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[--color-text] mb-3">Tilvalg</p>
          <div className="space-y-2">
            {trip.extras.map(extra => (
              <label
                key={extra.name}
                className="flex items-center justify-between border border-[--color-border] rounded-lg p-4 cursor-pointer hover:border-[--color-muted] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedExtras.includes(extra.name)}
                    onChange={() => toggleExtra(extra.name)}
                    className="accent-[--color-cta] w-4 h-4"
                  />
                  <span className="text-[--color-text]">{extra.name}</span>
                </div>
                <span className="text-[--color-gold] font-medium">+ {extra.price_eur} EUR</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Prisoppsummering */}
      <div className="bg-[--color-sand] rounded-xl p-5 space-y-2">
        <p className="text-sm font-medium text-[--color-text] mb-3">Prisoppsummering</p>
        <div className="flex justify-between text-sm text-[--color-subtle]">
          <span>Depositum (betales nå)</span>
          <span>{trip.deposit_eur} EUR</span>
        </div>
        {selectedExtras.map(name => {
          const extra = trip.extras.find(e => e.name === name)
          return extra ? (
            <div key={name} className="flex justify-between text-sm text-[--color-subtle]">
              <span>+ {extra.name}</span>
              <span>{extra.price_eur} EUR</span>
            </div>
          ) : null
        })}
        <div className="border-t border-[--color-border] pt-2 flex justify-between font-bold text-[--color-gold]">
          <span>Total depositum</span>
          <span>{totalDeposit} EUR</span>
        </div>
      </div>

      {/* Knapper */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-[--color-subtle] hover:text-[--color-text] transition-colors"
        >
          ← Tilbake
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-[--color-cta] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Gå til betaling →
        </button>
      </div>
    </div>
  )
}
