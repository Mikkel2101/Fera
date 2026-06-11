export default function TravelsLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-(--color-community) to-(--color-dark-mid) px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="h-3 w-24 bg-white/10 rounded-full mb-4 animate-pulse" />
          <div className="h-12 w-80 bg-white/10 rounded-xl mb-4 animate-pulse" />
          <div className="h-6 w-full max-w-lg bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
      {/* Trip grid skeleton */}
      <div className="bg-(--color-sand)">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-(--color-dark-card) rounded-[14px] overflow-hidden">
                <div className="aspect-video bg-white/5 animate-pulse" />
                <div className="p-4">
                  <div className="h-3 w-20 bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-6 w-full bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse mb-4" />
                  <div className="flex justify-between">
                    <div className="h-7 w-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-8 w-28 bg-white/20 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
