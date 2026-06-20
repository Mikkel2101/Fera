'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductImageGallery({
  images,
  name,
}: {
  images: string[]
  name: string
}) {
  const [activeIdx, setActiveIdx] = useState(0)

  const activeImage = images[activeIdx] ?? null

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-(--color-ice-light) rounded-2xl overflow-hidden">
        {activeImage ? (
          <Image
            key={activeIdx}
            src={activeImage}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8 transition-opacity duration-200"
            priority={activeIdx === 0}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-8xl opacity-20">🏓</span>
            <p className="text-(--color-muted) text-sm">Bilde kommer snart</p>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIdx
                  ? 'border-(--color-cta)'
                  : 'border-(--color-border) hover:border-(--color-muted)'
              }`}
              aria-label={`Vis bilde ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                sizes="100px"
                className="object-contain p-2 bg-(--color-ice-light)"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
