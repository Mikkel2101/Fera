'use client'

import { useState } from 'react'
import { step2Schema } from '@/lib/booking/schema'
import type { Step2Data } from '@/lib/booking/schema'
import { previewExtras, resolveExtras, type ExtraSelection } from '@/lib/booking/extras'
import { calculatePrice } from '@/lib/booking/pricing'
import {
  ROOM_PREFERENCES,
  ROOM_SHARE_GENDERS,
  roomTypeFor,
  type RoomPreference,
  type RoomShareGender,
} from '@/lib/booking/rooms'
import type { BookingTrip } from './BookingShell'
import ExtrasPicker from './ExtrasPicker'
import PriceSummary from './PriceSummary'

type Props = {
  trip:   BookingTrip
  data:   Partial<Step2Data>
  onBack: () => void
  onNext: (data: Step2Data) => void
}

export default function Step2RoomExtras({ trip, data, onBack, onNext }: Props) {
  const [preference,   setPreference]   = useState<RoomPreference | undefined>(data.room_preference)
  const [roommateName, setRoommateName] = useState(data.roommate_name ?? '')
  const [gender,       setGender]       = useState<RoomShareGender | undefined>(data.room_share_gender)
  const [selections,   setSelections]   = useState<ExtraSelection[]>(data.extras ?? [])
  const [errors,       setErrors]       = useState<Record<string, string>>({})

  const singleSupplement = Math.max(trip.price_single_eur - trip.price_double_eur, 0)
  const extrasPreview    = previewExtras(selections, trip.extras)
  const price            = calculatePrice(trip, preference ? roomTypeFor(preference) : 'Dobbel', extrasPreview)

  function handleSubmit() {
    const parsed = step2Schema.safeParse({
      room_preference:   preference,
      roommate_name:     preference === 'partner' ? roommateName.trim() || undefined : undefined,
      room_share_gender: preference === 'match' ? gender : undefined,
      extras:            selections,
    })
    const extrasCheck = resolveExtras(selections, trip.extras)

    if (!parsed.success || !extrasCheck.ok) {
      const flat = parsed.success ? {} : parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>
      setErrors({
        room_preference:   flat.room_preference?.[0] ?? '',
        roommate_name:     flat.roommate_name?.[0] ?? '',
        room_share_gender: flat.room_share_gender?.[0] ?? '',
        extras:            extrasCheck.ok ? '' : extrasCheck.error,
      })
      return
    }
    onNext(parsed.data)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-display font-semibold text-(--color-text) mt-6">
        Rom &amp; tillegg
      </h2>

      <fieldset>
        <legend className="text-sm font-medium text-(--color-text) mb-3">
          Romønske <span className="text-red-500">*</span>
        </legend>
        <div className="space-y-3">
          {ROOM_PREFERENCES.map(option => (
            <label
              key={option.value}
              className={`flex items-start justify-between gap-4 border rounded-lg p-4 cursor-pointer transition-colors ${
                preference === option.value
                  ? 'border-(--color-cta) bg-(--color-sand-light)'
                  : 'border-(--color-border) hover:border-(--color-muted)'
              }`}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="room_preference"
                  value={option.value}
                  checked={preference === option.value}
                  onChange={() => { setPreference(option.value); setErrors({}) }}
                  className="accent-(--color-cta) mt-1"
                />
                <span className="font-medium text-(--color-text)">{option.label}</span>
              </span>
              {option.value === 'single' && singleSupplement > 0 && (
                <span className="text-(--color-muted) whitespace-nowrap">+ {singleSupplement} EUR</span>
              )}
            </label>
          ))}
        </div>
        {errors.room_preference && <p className="text-red-500 text-sm mt-1">{errors.room_preference}</p>}

        {preference === 'partner' && (
          <div className="mt-3">
            <label htmlFor="booking-roommate" className="block text-sm font-medium text-(--color-text) mb-1">
              Navn på reisepartneren <span className="text-red-500">*</span>
            </label>
            <input
              id="booking-roommate"
              type="text"
              value={roommateName}
              onChange={e => setRoommateName(e.target.value)}
              aria-describedby="booking-roommate-hint"
              className="border border-(--color-border) rounded-lg px-4 py-3 w-full focus:outline-none focus:border-(--color-cta)"
            />
            <p id="booking-roommate-hint" className="text-xs text-(--color-muted) mt-1">
              Reisepartneren må reservere sin egen plass. Å skrive navnet her reserverer ikke plass for dem.
            </p>
            {errors.roommate_name && <p className="text-red-500 text-sm mt-1">{errors.roommate_name}</p>}
          </div>
        )}

        {preference === 'match' && (
          <div className="mt-3">
            <label htmlFor="booking-gender" className="block text-sm font-medium text-(--color-text) mb-1">
              Kjønn <span className="text-red-500">*</span>
            </label>
            <select
              id="booking-gender"
              value={gender ?? ''}
              onChange={e => setGender((e.target.value || undefined) as RoomShareGender | undefined)}
              aria-describedby="booking-gender-hint"
              className="border border-(--color-border) rounded-lg px-4 py-3 w-full bg-white focus:outline-none focus:border-(--color-cta)"
            >
              <option value="">Velg</option>
              {ROOM_SHARE_GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <p id="booking-gender-hint" className="text-xs text-(--color-muted) mt-1">
              Vi parer deg med en annen deltaker av samme kjønn og tar kontakt hvis vi ikke finner en romkamerat.
              Du får aldri enkeltromstillegg uten at vi har avtalt det med deg.
            </p>
            {errors.room_share_gender && <p className="text-red-500 text-sm mt-1">{errors.room_share_gender}</p>}
          </div>
        )}
      </fieldset>

      {trip.extras.length > 0 && (
        <div>
          <p className="text-sm font-medium text-(--color-text) mb-3">Tillegg</p>
          <ExtrasPicker extras={trip.extras} selections={selections} onChange={setSelections} />
          {errors.extras && <p className="text-red-500 text-sm mt-1">{errors.extras}</p>}
        </div>
      )}

      <PriceSummary price={price} extras={extrasPreview} />

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-(--color-subtle) hover:text-(--color-text) transition-colors"
        >
          ← Tilbake
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-(--color-cta) text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Neste: Kontroller →
        </button>
      </div>
    </div>
  )
}
