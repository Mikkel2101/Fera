'use client'

import { useState } from 'react'

export type EditableExtra = {
  name:                string
  price_eur:           number
  original_price_eur?: number
  description?:        string
  sizes?:              string[]
  max_quantity?:       number
}

type Props = {
  extras:   EditableExtra[]
  onChange: (extras: EditableExtra[]) => void
}

const inputClass = 'border border-(--color-border) rounded-lg px-3 py-2 focus:outline-none focus:border-(--color-cta) text-sm'

function parseSizes(text: string): string[] | undefined {
  const sizes = text.split(',').map(s => s.trim()).filter(Boolean)
  return sizes.length > 0 ? sizes : undefined
}

// Størrelser skrives som kommaseparert tekst. Teksten holdes lokalt så
// «S, » ikke klippes mens admin skriver.
export default function ExtrasEditor({ extras, onChange }: Props) {
  const [sizeTexts, setSizeTexts] = useState(() => extras.map(e => (e.sizes ?? []).join(', ')))

  function patch(index: number, changes: Partial<EditableExtra>) {
    onChange(extras.map((x, j) => (j === index ? { ...x, ...changes } : x)))
  }

  function setSizes(index: number, text: string) {
    setSizeTexts(prev => prev.map((t, j) => (j === index ? text : t)))
    patch(index, { sizes: parseSizes(text) })
  }

  function add() {
    setSizeTexts(prev => [...prev, ''])
    onChange([...extras, { name: '', price_eur: 0 }])
  }

  function remove(index: number) {
    setSizeTexts(prev => prev.filter((_, j) => j !== index))
    onChange(extras.filter((_, j) => j !== index))
  }

  return (
    <>
      {extras.map((e, i) => (
        <div key={i} className="space-y-2 border-b border-(--color-border) pb-3 last:border-0">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={e.name}
              onChange={ev => patch(i, { name: ev.target.value })}
              placeholder="Navn"
              aria-label="Navn på tillegg"
              className={`${inputClass} w-full`}
            />
            <input
              type="number"
              value={e.price_eur}
              onChange={ev => patch(i, { price_eur: parseFloat(ev.target.value) || 0 })}
              placeholder="EUR"
              aria-label="Pris i EUR"
              className={`${inputClass} w-24`}
              min={0} step={0.01}
            />
            <button type="button" onClick={() => remove(i)} aria-label="Fjern tillegg"
              className="text-(--color-muted) hover:text-red-500 text-sm px-2">✕</button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-xs text-(--color-muted) flex items-center gap-2">
              Normalpris (ved salg, valgfritt)
              <input
                type="number"
                value={e.original_price_eur ?? ''}
                onChange={ev => {
                  const parsed = parseFloat(ev.target.value)
                  patch(i, { original_price_eur: Number.isFinite(parsed) ? parsed : undefined })
                }}
                placeholder="EUR"
                aria-label="Normalpris før salg i EUR"
                className={`${inputClass} w-24`}
                min={0} step={0.01}
              />
            </label>
            <input
              type="text"
              value={sizeTexts[i] ?? ''}
              onChange={ev => setSizes(i, ev.target.value)}
              placeholder="Størrelser, f.eks. S, M, L, XL (valgfritt)"
              aria-label="Størrelser"
              className={`${inputClass} flex-1 min-w-48`}
            />
            <label className="text-xs text-(--color-muted) flex items-center gap-2">
              Maks antall per person
              <input
                type="number"
                value={e.max_quantity ?? 1}
                onChange={ev => patch(i, { max_quantity: Math.max(parseInt(ev.target.value) || 1, 1) })}
                className={`${inputClass} w-20`}
                min={1} max={20}
              />
            </label>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="text-(--color-cta) text-sm hover:underline">
        + Legg til tillegg
      </button>
    </>
  )
}
