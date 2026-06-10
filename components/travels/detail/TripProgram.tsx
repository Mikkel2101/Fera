export default function TripProgram({ program }: { program: string | null }) {
  if (!program) return null

  const lines = program.split('\n')
  const blocks: { day: string | null; lines: string[] }[] = []
  let current: { day: string | null; lines: string[] } = { day: null, lines: [] }

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^(dag\s*\d|day\s*\d)/i.test(trimmed) || /^\*\*dag/i.test(trimmed)) {
      if (current.lines.length > 0 || current.day) blocks.push(current)
      current = { day: trimmed.replace(/^\*\*|\*\*$/g, ''), lines: [] }
    } else if (trimmed) {
      current.lines.push(trimmed)
    }
  }
  if (current.lines.length > 0 || current.day) blocks.push(current)

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-3">Program</p>
        <h2 className="font-display italic font-bold text-(--color-text) text-3xl mb-10">Dag-for-dag</h2>

        {blocks.length > 1 ? (
          <div className="space-y-6">
            {blocks.map((block, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-(--color-dark) text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  {i < blocks.length - 1 && (
                    <div className="w-px flex-1 bg-(--color-border) mt-2" />
                  )}
                </div>
                <div className="pb-8 min-w-0">
                  {block.day && (
                    <p className="font-display font-bold text-(--color-text) text-lg capitalize mb-2">{block.day}</p>
                  )}
                  <div className="space-y-1">
                    {block.lines.map((l, j) => (
                      <p key={j} className="text-(--color-muted) text-sm leading-relaxed">{l}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-(--color-muted) leading-relaxed text-sm">{program}</p>
        )}
      </div>
    </section>
  )
}
