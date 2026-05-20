import type { PayloadHandler } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const generateBlur: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.routeParams?.id as string

  const doc = await req.payload.findByID({ collection: 'media', id, req })

  if (!doc?.filename) {
    return Response.json({ error: 'Media not found' }, { status: 404 })
  }

  const filePath = path.resolve(dirname, '../../../public/media', doc.filename as string)

  if (!fs.existsSync(filePath)) {
    return Response.json({ error: 'File not found on disk' }, { status: 404 })
  }

  const buffer = await sharp(filePath)
    .resize(20, 20, { fit: 'inside' })
    .webp({ quality: 40 })
    .toBuffer()

  const blurDataUrl = `data:image/webp;base64,${buffer.toString('base64')}`

  await req.payload.update({ collection: 'media', id, data: { blurDataUrl }, req })

  return Response.json({ blurDataUrl })
}
