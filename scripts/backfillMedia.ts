/**
 * Backfill script for existing Media documents.
 *
 * What it does (in order, per doc):
 *   1. If the file on disk is not already WebP, re-runs Payload's upload pipeline
 *      (`payload.update({ ..., file })`). Payload regenerates all imageSizes via the
 *      new `formatOptions` and the `beforeChange` hook adds `blurDataURL`. The old
 *      original + size variants are replaced; URL/filename in the DB updates from
 *      `.jpg`/`.png` to `.webp`.
 *   2. If the file is already WebP but `blurDataURL` is missing, generates only the
 *      blur preview and writes it back.
 *
 * Run:  pnpm backfill:media
 *
 * Idempotent — running again skips anything already migrated.
 *
 * Caveats:
 *   - External links to `/media/old-name.jpg` will 404 after step 1 (filename
 *     becomes `.webp`). Internal usage via Payload relations is unaffected.
 *   - SVG and non-image uploads are skipped entirely.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const MEDIA_DIR = path.resolve(here, '../public/media')

async function generateBlurDataURL(buffer: Buffer): Promise<string | null> {
  try {
    const out = await sharp(buffer)
      .resize(20, 20, { fit: 'inside' })
      .webp({ quality: 40 })
      .toBuffer()
    return `data:image/webp;base64,${out.toString('base64')}`
  } catch {
    return null
  }
}

async function main() {
  const payload = await getPayload({ config })

  let page = 1
  let scanned = 0
  let reencoded = 0
  let blurOnly = 0
  let skipped = 0

  while (true) {
    const result = await payload.find({
      collection: 'media',
      limit: 25,
      page,
      depth: 0,
      pagination: true,
      // Sort by an immutable key — otherwise `updatedAt DESC` (Payload default) shifts docs we just
      // touched back to page 1 and we'd skip pages 2+.
      sort: 'id',
    })

    for (const doc of result.docs) {
      scanned++

      const { id, filename, mimeType, blurDataURL } = doc

      if (!filename || !mimeType?.startsWith('image/') || mimeType === 'image/svg+xml') {
        skipped++
        continue
      }

      const filepath = path.join(MEDIA_DIR, filename)
      let buffer: Buffer
      try {
        buffer = await fs.readFile(filepath)
      } catch {
        payload.logger.warn(`skip ${filename}: file missing on disk`)
        skipped++
        continue
      }

      const isWebp = filename.toLowerCase().endsWith('.webp')

      if (!isWebp) {
        // Re-run upload pipeline: regenerates sizes as WebP + fires blur hook.
        await payload.update({
          collection: 'media',
          id,
          data: {},
          file: {
            data: buffer,
            mimetype: mimeType,
            name: filename,
            size: buffer.length,
          },
        })
        reencoded++
        payload.logger.info(`re-encoded: ${filename}`)
        continue
      }

      if (!blurDataURL) {
        const blur = await generateBlurDataURL(buffer)
        if (blur) {
          await payload.update({
            collection: 'media',
            id,
            data: { blurDataURL: blur },
          })
          blurOnly++
          payload.logger.info(`blur added: ${filename}`)
          continue
        }
      }

      skipped++
    }

    if (!result.hasNextPage) break
    page++
  }

  payload.logger.info(
    `done — scanned: ${scanned}, re-encoded: ${reencoded}, blur-only: ${blurOnly}, skipped: ${skipped}`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
