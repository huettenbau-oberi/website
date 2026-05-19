import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { generateBlurDataURL } from './hooks/generateBlurDataURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    beforeChange: [generateBlurDataURL],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'blurDataURL',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    // Strip EXIF/IPTC metadata to shrink files and avoid leaking camera/location data.
    withMetadata: false,
    // Re-encode originals to WebP at upload time so the file on disk is already compressed;
    // Next.js Image will then transcode to AVIF/WebP per request without paying a second JPEG decode cost.
    formatOptions: {
      format: 'webp',
      options: { quality: 80 },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      {
        name: 'square',
        width: 500,
        height: 500,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'small',
        width: 600,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'medium',
        width: 900,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'large',
        width: 1400,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'xlarge',
        width: 1920,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        // Social preview image — kept as JPEG because some crawlers (LinkedIn, older WhatsApp clients)
        // still don't reliably render WebP/AVIF in OG previews.
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
        formatOptions: { format: 'jpeg', options: { quality: 82, mozjpeg: true } },
      },
    ],
  },
}
