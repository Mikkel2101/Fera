type Extra = { name: string; price_eur: number; description?: string }

export default function TripExtras({ extras }: { extras: Extra[] }) {
  if (!extras.length) return null

  return (
    <section className="py-10">
      <div>
        <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">Tilvalg</p>
        <h2 className="font-display italic font-bold text-(--color-text) text-3xl mb-4">Legg til ekstra</h2>
        <p className="text-(--color-muted) text-sm mb-8">Valgfrie tillegg bestilles underveis i booking-prosessen.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {extras.map((extra, i) => (
            <div key={i} className="bg-(--color-sand-light) border border-(--color-border) rounded-xl p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-(--color-text) mb-1">{extra.name}</p>
                {extra.description && (
                  <p className="text-(--color-muted) text-xs leading-relaxed">{extra.description}</p>
                )}
              </div>
              <span className="shrink-0 font-display font-bold text-(--color-dark) text-lg whitespace-nowrap">
                + {extra.price_eur} EUR
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
