/** 默认：长边上限、目标体积、JPEG 起始质量；质量会阶梯下降直到达标或触底。 */
const DEFAULT_MAX_SIDE = 1280
const DEFAULT_MAX_BYTES = 512 * 1024
const DEFAULT_INITIAL_QUALITY = 0.62
const MIN_QUALITY = 0.38
const QUALITY_STEP = 0.07

async function decodeToDrawable(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file)
  } catch {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('image-decode'))
      }
      img.src = url
    })
  }
}

export interface CompressImageOptions {
  /** 长边最大像素 */
  maxSide?: number
  /** 压缩后尽量不超过的字节数 */
  maxBytes?: number
  /** JPEG 初始质量 0–1 */
  initialQuality?: number
}

/**
 * 将图片压成 JPEG：缩小尺寸 + 降低质量，尽量控制在 maxBytes 以内。
 * 解码失败时返回原文件。
 */
export async function compressImageFile(file: File, options: CompressImageOptions = {}): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file
  }

  const maxSide = options.maxSide ?? DEFAULT_MAX_SIDE
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  let quality = options.initialQuality ?? DEFAULT_INITIAL_QUALITY

  let drawable: ImageBitmap | HTMLImageElement
  try {
    drawable = await decodeToDrawable(file)
  } catch {
    return file
  }

  const width = drawable instanceof ImageBitmap ? drawable.width : drawable.naturalWidth
  const height = drawable instanceof ImageBitmap ? drawable.height : drawable.naturalHeight
  if (!width || !height) {
    if (drawable instanceof ImageBitmap) drawable.close()
    return file
  }

  const scale = Math.min(1, maxSide / Math.max(width, height))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    if (drawable instanceof ImageBitmap) drawable.close()
    return file
  }

  ctx.drawImage(drawable, 0, 0, w, h)
  if (drawable instanceof ImageBitmap) drawable.close()

  const toJpeg = (q: number) =>
    new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', q)
    })

  let blob: Blob | null = null
  for (let i = 0; i < 8; i++) {
    blob = await toJpeg(quality)
    if (!blob || blob.size === 0) break
    if (blob.size <= maxBytes || quality <= MIN_QUALITY) break
    quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP)
  }

  if (!blob || blob.size === 0) {
    return file
  }

  if (blob.size >= file.size && file.size > 0) {
    return file
  }

  const base = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
}
