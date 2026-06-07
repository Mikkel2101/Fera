export default function TripProgram({ program }: { program: string | null }) {
  if (!program) return null

  return (
    <section className="bg-(--color-surface) px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-(--color-text) mb-6">
          Dag-for-dag program
        </h2>
        <p className="whitespace-pre-wrap text-(--color-muted) leading-relaxed">{program}</p>
      </div>
    </section>
  )
}
