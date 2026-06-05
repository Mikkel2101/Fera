type Extra = { name: string; price_eur: number }

export default function TripExtras({ extras }: { extras: Extra[] }) {
  if (!extras.length) return null

  return (
    <section className="bg-[--color-surface] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-[--color-text] mb-6">Tilvalg</h2>
        <ul className="flex flex-col gap-3">
          {extras.map((extra, i) => (
            <li key={i} className="flex items-center justify-between border-b border-[--color-border] pb-3">
              <span className="text-[--color-text]">{extra.name}</span>
              <span className="text-[--color-gold] font-semibold">+ {extra.price_eur} EUR</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
