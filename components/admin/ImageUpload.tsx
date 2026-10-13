'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { uploadArticleImage } from '@/lib/articles/upload'

type Props = {
  articleId: string
  value: string
  onChange: (url: string) => void
  onError: (message: string) => void
}

export default function ImageUpload({ articleId, value, onChange, onError }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setIsUploading(true)
    const result = await uploadArticleImage(file, articleId)
    setIsUploading(false)
    if (input.current) input.current.value = ''
    if (!result.ok) {
      onError(result.error)
      return
    }
    onChange(result.url)
  }

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-(--color-border)">
          <Image src={value} alt="" fill sizes="600px" className="object-cover" unoptimized />
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={isUploading}
          className="border border-(--color-border) text-(--color-text) text-sm font-medium rounded-full px-4 py-2 hover:border-(--color-cta) disabled:opacity-50"
        >
          {isUploading ? 'Laster opp …' : value ? 'Bytt bilde' : 'Last opp bilde'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-sm text-(--color-muted) hover:text-(--color-cta)"
          >
            Fjern
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  )
}
