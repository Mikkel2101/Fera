'use client'

import type { ExtraSelection, TripExtra } from '@/lib/booking/extras'

type Props = {
  extras:     TripExtra[]
  selections: ExtraSelection[]
  onChange:   (selections: ExtraSelection[]) => void
}

// Ett valg per tillegg: kunden velger størrelse og antall når tillegget har det
export default function ExtrasPicker({ extras, selections, onChange }: Props) {
  const selectionFor = (name: string) => selections.find(s => s.name === name)

  function toggle(extra: TripExtra) {
    const isSelected = Boolean(selectionFor(extra.name))
    onChange(isSelected
      ? selections.filter(s => s.name !== extra.name)
      : [...selections, { name: extra.name, quantity: 1 }])
  }

  function patch(name: string, changes: Partial<ExtraSelection>) {
    onChange(selections.map(s => (s.name === name ? { ...s, ...changes } : s)))
  }

  return (
    <div className="space-y-2">
      {extras.map(extra => {
        const selection = selectionFor(extra.name)
        return (
          <div
            key={extra.name}
            className={`border rounded-lg p-4 transition-colors ${
              selection ? 'border-(--color-cta) bg-(--color-sand-light)' : 'border-(--color-border)'
            }`}
          >
            <label className="flex items-start justify-between gap-4 cursor-pointer">
              <span className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(selection)}
                  onChange={() => toggle(extra)}
                  className="accent-(--color-cta) w-4 h-4 mt-1"
                />
                <span>
                  <span className="flex items-center gap-2">
                    <span className="text-(--color-text)">{extra.name}</span>
                    {extra.original_price_eur !== null && (
                      <span className="bg-(--color-success) text-white text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                        Lanseringstilbud
                      </span>
                    )}
                  </span>
                  {extra.description && (
                    <span className="block text-sm text-(--color-subtle)">{extra.description}</span>
                  )}
                </span>
              </span>
              <span className="whitespace-nowrap text-right">
                {extra.original_price_eur !== null && (
                  <span className="block text-sm text-(--color-muted) line-through">
                    <span className="sr-only">Normalpris </span>{extra.original_price_eur} EUR
                  </span>
                )}
                <span className="text-(--color-gold) font-medium">
                  {extra.original_price_eur !== null && <span className="sr-only">Nå </span>}+ {extra.price_eur} EUR
                </span>
              </span>
            </label>

            {selection && (extra.sizes.length > 0 || extra.max_quantity > 1) && (
              <div className="flex flex-wrap gap-4 mt-3 pl-7">
                {extra.sizes.length > 0 && (
                  <label className="text-sm text-(--color-text)">
                    Størrelse
                    <select
                      value={selection.size ?? ''}
                      onChange={e => patch(extra.name, { size: e.target.value || undefined })}
                      className="ml-2 border border-(--color-border) rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="">Velg</option>
                      {extra.sizes.map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                  </label>
                )}
                {extra.max_quantity > 1 && (
                  <label className="text-sm text-(--color-text)">
                    Antall
                    <select
                      value={selection.quantity}
                      onChange={e => patch(extra.name, { quantity: Number(e.target.value) })}
                      className="ml-2 border border-(--color-border) rounded-lg px-3 py-2 bg-white"
                    >
                      {Array.from({ length: extra.max_quantity }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
