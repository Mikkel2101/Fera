type Coach = { name: string; title: string; bio: string }

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function TripCoaches({ coaches }: { coaches: Coach[] }) {
  if (!coaches.length) return null

  return (
    <section className="bg-[--color-sand] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-[--color-text] mb-8">
          Møt coachene
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {coaches.map((coach, i) => (
            <div key={i} className="flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-[--color-gold] flex items-center justify-center text-white font-bold text-sm">
                {initials(coach.name)}
              </div>
              <div>
                <p className="font-semibold text-[--color-text]">{coach.name}</p>
                <p className="text-[--color-muted] text-sm mb-2">{coach.title}</p>
                <p className="text-[--color-text] text-sm leading-relaxed">{coach.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
