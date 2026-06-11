export default function ShopLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="bg-(--color-community) py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="h-3 w-24 bg-white/10 rounded-full mb-4 animate-pulse" />
          <div className="h-10 w-80 bg-white/10 rounded-xl mb-4 animate-pulse" />
          <div className="h-6 w-64 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
      {/* Product grid skeleton */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-(--color-border)">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white p-4">
              <div className="aspect-square bg-(--color-ice) rounded-lg animate-pulse mb-3" />
              <div className="h-3 w-16 bg-(--color-border) rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-(--color-border) rounded animate-pulse mb-1" />
              <div className="h-4 w-2/3 bg-(--color-border) rounded animate-pulse mb-3" />
              <div className="h-5 w-16 bg-(--color-border) rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
