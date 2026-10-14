'use client'

import { useState } from 'react'
import ContactForm from '@/components/shared/ContactForm'

type Audience = 'senter_klubb' | 'bedrift' | 'gruppe'

const AUDIENCES: { key: Audience; label: string }[] = [
  { key: 'senter_klubb', label: 'Senter / Klubb' },
  { key: 'bedrift', label: 'Bedrift' },
  { key: 'gruppe', label: 'Gruppe' },
]

const ORG_LABEL: Record<Audience, string> = {
  senter_klubb: 'Padelsenter/klubb',
  bedrift: 'Bedrift',
  gruppe: 'Gruppenavn (valgfritt)',
}

export default function TilbudForm() {
  const [audience, setAudience] = useState<Audience>('senter_klubb')

  return (
    <div>
      <p className="text-white text-lg font-medium text-center mb-4">Hvem er dere?</p>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {AUDIENCES.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => setAudience(a.key)}
            aria-pressed={audience === a.key}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              audience === a.key
                ? 'bg-white text-(--color-dark)'
                : 'border border-white/30 text-white hover:border-white/60'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <ContactForm
        type={`skreddersydd-${audience}`}
        fields={[
          { name: 'navn', label: 'Ditt navn', required: true },
          { name: 'organisasjon', label: ORG_LABEL[audience], required: audience !== 'gruppe' },
          { name: 'epost', label: 'E-post', type: 'email', required: true },
          { name: 'telefon', label: 'Telefon' },
          { name: 'antall', label: 'Estimert antall deltakere' },
        ]}
        dateRangeField={{ label: 'Ønsket periode', fromName: 'fra_dato', toName: 'til_dato' }}
        messagePlaceholder="Nivå, destinasjon dere drømmer om, aktivitetsmix, budsjettramme, spesielle ønsker..."
        messageLabel="Fortell oss om nivå og ønsker"
        submitLabel="Be om tilbud →"
        successMessage="Takk for forespørselen! Vi sender et tilpasset tilbud innen 24 timer."
      />
    </div>
  )
}
