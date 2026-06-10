import Image from 'next/image'

type Coach = { name: string; title?: string; bio: string; image?: string }

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function TripCoaches({ coaches }: { coaches: Coach[] }) {
  if (!coaches.length) return null

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 bg-(--color-ice-light)">
      <div className="max-w-4xl mx-auto">
        <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-3">Coaching</p>
        <h2 className="font-display italic font-bold text-(--color-text) text-3xl mb-10">Møt coachene</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {coaches.map((coach, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-(--color-border) flex gap-5">
              <div className="shrink-0">
                {coach.image ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden relative">
                    <Image
                      src={coach.image}
                      alt={coach.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-(--color-dark) flex items-center justify-center text-white font-bold text-lg">
                    {initials(coach.name)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-(--color-text) text-lg leading-tight">{coach.name}</p>
                {coach.title && (
                  <p className="text-(--color-gold) text-xs font-medium uppercase tracking-wider mt-0.5 mb-3">{coach.title}</p>
                )}
                <p className="text-(--color-muted) text-sm leading-relaxed">{coach.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
