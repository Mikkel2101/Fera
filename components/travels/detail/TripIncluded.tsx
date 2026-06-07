export default function TripIncluded({ included }: { included: string[] }) {
  if (!included.length) return null

  return (
    <section className="bg-(--color-sand) px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-(--color-text) mb-6">
          Hva er inkludert
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {included.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-(--color-success) font-bold mt-0.5">✓</span>
              <span className="text-(--color-text)">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
