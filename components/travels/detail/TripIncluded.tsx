export default function TripIncluded({ included }: { included: string[] }) {
  if (!included.length) return null

  return (
    <section className="py-10">
      <div>
        <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">Alt inkludert</p>
        <h2 className="font-sans font-bold text-(--color-text) text-4xl mb-10">Inkludert i prisen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {included.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-(--color-sand-light) rounded-xl px-5 py-4">
              <span className="shrink-0 w-6 h-6 rounded-full bg-(--color-success) flex items-center justify-center mt-0.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5l2.5 2.5 5-5"/>
                </svg>
              </span>
              <span className="text-(--color-text) text-sm leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
