import type { CollectionBeforeChangeHook } from 'payload'
import sharp from 'sharp'

/**
 * Generates a tiny base64-encoded WebP preview (~20px wide) for use as Next.js Image
 * `placeholder="blur"`. Skipped for non-image uploads and when the file buffer is missing
 * (e.g. metadata-only updates).
 */
export const generateBlurDataURL: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== 'create' && operation !== 'update') return data

  const file = req.file
  if (!file?.data || !file.mimetype?.startsWith('image/') || file.mimetype === 'image/svg+xml') {
    return data
  }

  try {
    const buffer = await sharp(file.data)
      .resize(20, 20, { fit: 'inside' })
      .webp({ quality: 40 })
      .toBuffer()

    return {
      ...data,
      blurDataUrl: `data:image/webp;base64,${buffer.toString('base64')}`,
    }
  } catch {
    return data
  }
}
