export const MAX_IMAGE_WIDTH = 2000
const QUALITY = 0.85

type OutputFormat = { contentType: 'image/webp' | 'image/jpeg'; extension: 'webp' | 'jpg' }

export function scaledDimensions(width: number, height: number, maxWidth = MAX_IMAGE_WIDTH) {
  if (width <= maxWidth) return { width, height }
  return { width: maxWidth, height: Math.round(height * (maxWidth / width)) }
}

// Safari kan ikke kode WebP og returnerer stille PNG — da koder vi om som JPEG.
export function pickOutputFormat(blobType: string): OutputFormat | null {
  if (blobType === 'image/webp') return { contentType: 'image/webp', extension: 'webp' }
  if (blobType === 'image/jpeg') return { contentType: 'image/jpeg', extension: 'jpg' }
  return null
}

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Kunne ikke komprimere bildet'))),
      type,
      QUALITY,
    )
  })
}

export async function compressImage(file: Blob): Promise<{ blob: Blob; contentType: string; extension: string }> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = scaledDimensions(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D er ikke tilgjengelig')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const webp = await encode(canvas, 'image/webp')
  const format = pickOutputFormat(webp.type)
  if (format) return { blob: webp, ...format }

  const jpeg = await encode(canvas, 'image/jpeg')
  return { blob: jpeg, contentType: 'image/jpeg', extension: 'jpg' }
}
