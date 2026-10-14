'use client'

import { useState } from 'react'
import { step1Schema } from '@/lib/booking/schema'
import type { Step1Data } from '@/lib/booking/schema'
import { COURT_SIDES, PADEL_LEVELS, TRIP_GOALS } from '@/lib/booking/levels'

type Props = {
  data: Partial<Step1Data>
  // E-posten kommer fra Fera-kontoen og kan ikke endres i skjemaet
  lockedEmail: string
  onNext: (data: Step1Data) => void
}

type FormState = {
  first_name:       string
  last_name:        string
  email:            string
  phone:            string
  padel_level:      string
  preferred_side:   string
  trip_goal:        string
  special_requests: string
  allergies_preferences: string
}

// Tomme valgfrie felt sendes som undefined, ikke som tom streng
function toSchemaInput(form: FormState) {
  return {
    ...form,
    padel_level:      form.padel_level || undefined,
    preferred_side:   form.preferred_side || undefined,
    trip_goal:        form.trip_goal || undefined,
    special_requests: form.special_requests.trim() || undefined,
    allergies_preferences: form.allergies_preferences.trim() || undefined,
  }
}

type ChipOption = { value: string; label: string }

// Valgfritt enkeltvalg som knapperad. Klikk på valgt knapp fjerner valget.
function ChipGroup({ legend, options, value, onChange }: {
  legend:   string
  options:  ReadonlyArray<ChipOption>
  value:    string
  onChange: (value: string) => void
}) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-(--color-text) mb-3">
        {legend} <span className="font-normal text-(--color-muted)">(valgfritt)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(isSelected ? '' : option.value)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                isSelected
                  ? 'border-(--color-cta) bg-(--color-cta) text-white'
                  : 'border-(--color-border) text-(--color-text) hover:border-(--color-muted)'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function fieldErrorsOf(form: FormState): Record<string, string> {
  const result = step1Schema.safeParse(toSchemaInput(form))
  if (result.success) return {}
  const flat = result.error.flatten().fieldErrors as Record<string, string[] | undefined>
  return Object.fromEntries(Object.entries(flat).map(([key, msgs]) => [key, msgs?.[0] ?? '']))
}

export default function Step1PersonInfo({ data, lockedEmail, onNext }: Props) {
  const [form, setForm] = useState<FormState>({
    first_name:       data.first_name       ?? '',
    last_name:        data.last_name        ?? '',
    email:            lockedEmail,
    phone:            data.phone            ?? '',
    padel_level:      data.padel_level      ?? '',
    preferred_side:   data.preferred_side   ?? '',
    trip_goal:        data.trip_goal        ?? '',
    special_requests: data.special_requests ?? '',
    allergies_preferences: data.allergies_preferences ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function update(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function handleBlur(field: keyof FormState) {
    setErrors(prev => ({ ...prev, [field]: fieldErrorsOf(form)[field] ?? '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = step1Schema.safeParse(toSchemaInput(form))
    if (!parsed.success) {
      setErrors(fieldErrorsOf(form))
      return
    }
    onNext(parsed.data)
  }

  const inputClass = (field: string) =>
    `border rounded-lg px-4 py-3 w-full focus:outline-none ${
      errors[field]
        ? 'border-red-400 focus:border-red-400'
        : 'border-(--color-border) focus:border-(--color-cta)'
    }`

  const choiceClass = (isSelected: boolean) =>
    `flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
      isSelected
        ? 'border-(--color-cta) bg-(--color-sand-light)'
        : 'border-(--color-border) hover:border-(--color-muted)'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <h2 className="text-2xl font-display font-semibold text-(--color-text) mb-6">
        Dine opplysninger
      </h2>

      <div>
        <label htmlFor="booking-first-name" className="block text-sm font-medium text-(--color-text) mb-1">
          Fornavn <span className="text-red-500">*</span>
        </label>
        <input
          id="booking-first-name"
          type="text"
          autoComplete="given-name"
          value={form.first_name}
          onChange={e => update('first_name', e.target.value)}
          onBlur={() => handleBlur('first_name')}
          className={inputClass('first_name')}
        />
        {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
      </div>

      <div>
        <label htmlFor="booking-last-name" className="block text-sm font-medium text-(--color-text) mb-1">
          Etternavn <span className="text-red-500">*</span>
        </label>
        <input
          id="booking-last-name"
          type="text"
          autoComplete="family-name"
          value={form.last_name}
          onChange={e => update('last_name', e.target.value)}
          onBlur={() => handleBlur('last_name')}
          className={inputClass('last_name')}
        />
        <p className="text-xs text-(--color-muted) mt-1">Fullt navn slik det står i passet eller ID-kortet.</p>
        {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
      </div>

      <div>
        <label htmlFor="booking-email" className="block text-sm font-medium text-(--color-text) mb-1">
          E-post
        </label>
        <input
          id="booking-email"
          type="email"
          value={lockedEmail}
          readOnly
          aria-describedby="booking-email-hint"
          className="border border-(--color-border) bg-(--color-sand-light) text-(--color-subtle) rounded-lg px-4 py-3 w-full"
        />
        <p id="booking-email-hint" className="text-xs text-(--color-muted) mt-1">
          E-posten fra Fera-kontoen din. Bekreftelsen sendes hit.
        </p>
      </div>

      <div>
        <label htmlFor="booking-phone" className="block text-sm font-medium text-(--color-text) mb-1">
          Mobilnummer <span className="text-red-500">*</span>
        </label>
        <input
          id="booking-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+47 912 34 567"
          value={form.phone}
          onChange={e => update('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          aria-describedby="booking-phone-hint"
          className={inputClass('phone')}
        />
        <p id="booking-phone-hint" className="text-xs text-(--color-muted) mt-1">
          Med landskode. Norske nummer uten landskode får +47 automatisk.
        </p>
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-(--color-text) mb-1">
          Padelnivå <span className="text-red-500">*</span>
        </legend>
        <p className="text-xs text-(--color-muted) mb-3">
          Brukes til å sette sammen treningsgrupper. Trenerne kan justere etter første økt.
        </p>
        <div className="space-y-2">
          {PADEL_LEVELS.map(level => (
            <label key={level.value} className={choiceClass(form.padel_level === level.value)}>
              <input
                type="radio"
                name="padel_level"
                value={level.value}
                checked={form.padel_level === level.value}
                onChange={() => update('padel_level', level.value)}
                className="accent-(--color-cta) mt-1"
              />
              <span>
                <span className="block font-medium text-(--color-text)">{level.label}</span>
                <span className="block text-sm text-(--color-subtle)">{level.description}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.padel_level && <p className="text-red-500 text-sm mt-1">{errors.padel_level}</p>}
      </fieldset>

      <ChipGroup
        legend="Hvilken banehalvdel spiller du helst på?"
        options={COURT_SIDES}
        value={form.preferred_side}
        onChange={value => update('preferred_side', value)}
      />

      <ChipGroup
        legend="Hva vil du helst få ut av turen?"
        options={TRIP_GOALS}
        value={form.trip_goal}
        onChange={value => update('trip_goal', value)}
      />

      <div>
        <label htmlFor="booking-wishes" className="block text-sm font-medium text-(--color-text) mb-1">
          Ønsker for turen <span className="font-normal text-(--color-muted)">(valgfritt)</span>
        </label>
        <textarea
          id="booking-wishes"
          rows={3}
          maxLength={1000}
          value={form.special_requests}
          onChange={e => update('special_requests', e.target.value)}
          onBlur={() => handleBlur('special_requests')}
          aria-describedby="booking-wishes-hint"
          className={inputClass('special_requests')}
        />
        <p id="booking-wishes-hint" className="text-xs text-(--color-muted) mt-1">
          Hva vil du trene på, eller praktiske ønsker.
        </p>
        {errors.special_requests && <p className="text-red-500 text-sm mt-1">{errors.special_requests}</p>}
      </div>

      <div>
        <label htmlFor="booking-allergies" className="block text-sm font-medium text-(--color-text) mb-1">
          Allergier og preferanser <span className="font-normal text-(--color-muted)">(valgfritt)</span>
        </label>
        <textarea
          id="booking-allergies"
          rows={3}
          maxLength={1000}
          value={form.allergies_preferences}
          onChange={e => update('allergies_preferences', e.target.value)}
          onBlur={() => handleBlur('allergies_preferences')}
          aria-describedby="booking-allergies-hint"
          className={inputClass('allergies_preferences')}
        />
        <p id="booking-allergies-hint" className="text-xs text-(--color-muted) mt-1">
          Matallergier, spesialkost eller annet vi bør vite om før turen.
        </p>
        {errors.allergies_preferences && <p className="text-red-500 text-sm mt-1">{errors.allergies_preferences}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-(--color-cta) text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
      >
        Neste: Rom &amp; tillegg →
      </button>
    </form>
  )
}
