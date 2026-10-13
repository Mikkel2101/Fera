import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/images/compress'

const MB = 1024 * 1024
export const MAX_SOURCE_BYTES = 20 * MB
export const MAX_UPLOAD_BYTES = 5 * MB
const BUCKET = 'articles'
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export type UploadResult = { ok: true; url: string } | { ok: false; error: string }

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    return 'iPhone-bilder (HEIC) støttes ikke. Eksporter som JPG først.'
  }
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Filen må være et bilde (JPG, PNG eller WebP)'
  if (file.size > MAX_SOURCE_BYTES) return 'Bildet er for stort (maks 20 MB)'
  return null
}

export async function uploadArticleImage(file: File, articleId: string): Promise<UploadResult> {
  const invalid = validateImageFile(file)
  if (invalid) return { ok: false, error: invalid }

  let compressed: Awaited<ReturnType<typeof compressImage>>
  try {
    compressed = await compressImage(file)
  } catch (error) {
    console.error('[articles] komprimering feilet', error)
    return { ok: false, error: 'Kunne ikke lese bildet. Prøv en JPG- eller PNG-fil.' }
  }
  if (compressed.blob.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'Bildet er for stort selv etter komprimering (maks 5 MB)' }
  }

  const supabase = createClient()
  const path = `${articleId}/${crypto.randomUUID()}.${compressed.extension}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed.blob, { contentType: compressed.contentType, upsert: false })
  if (error) {
    console.error('[articles] opplasting feilet', path, error)
    return { ok: false, error: 'Opplastingen feilet. Prøv igjen.' }
  }
  return { ok: true, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl }
}
