import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { editor } from '../access/admin'
import { generateBlurDataURL } from './hooks/generateBlurDataURL'
import { generateBlur } from './endpoints/generateBlur'
import { cleanupMedia } from './endpoints/cleanupMedia'
import { renameMedia } from './endpoints/renameMedia'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  admin: {
    defaultColumns: ['filename', 'alt', 'isDecorative', 'updatedAt', 'folder'],
    listSearchableFields: ['filename', 'alt', 'folder.name'],
  },
  access: {
    create: editor,
    delete: editor,
    read: anyone,
    update: editor,
  },
  endpoints: [
    {
      method: 'post',
      path: '/:id/generate-blur',
      handler: generateBlur,
    },
    {
      method: 'post',
      path: '/cleanup',
      handler: cleanupMedia,
    },
    {
      method: 'post',
      path: '/:id/rename',
      handler: renameMedia,
    },
  ],
  hooks: {
    beforeChange: [generateBlurDataURL],
  },
  fields: [
    {
      name: 'filenameEditor',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/FilenameEditor',
        },
        disableListColumn: true,
      },
    },
    {
      name: 'alt',
      type: 'text',
      // Conditionally required: alt text MUST be provided for meaningful images so
      // screen-reader users get an equivalent of the image's content. The escape hatch
      // is `isDecorative` below — when checked, the image is treated as presentation-
      // only (alt=""), and this validate function passes regardless of value.
      validate: ((value: unknown, options: { siblingData?: { isDecorative?: boolean } }) => {
        if (options?.siblingData?.isDecorative) return true
        if (typeof value === 'string' && value.trim().length > 0) return true
        return 'Alt text is required. If the image is purely decorative, enable the "Decorative Image" option instead.'
      }) as never,
      admin: {
        description:
          'Describes the image content for screen readers and SEO. For purely decorative images, enable the toggle below.',
        condition: (_, siblingData) => !(siblingData as { isDecorative?: boolean })?.isDecorative,
        components: {
          Cell: '@/components/AltCell',
        },
      },
    },
    {
      name: 'isDecorative',
      type: 'checkbox',
      defaultValue: false,
      label: 'Decorative Image (no alt text)',
      admin: {
        description:
          'Enable if the image is purely decorative and has no meaning for understanding the page. Screen readers will then skip the image.',
      },
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
      name: 'blurDataUrl',
      type: 'text',
      admin: {
        readOnly: true,
        disableListColumn: true,
        components: {
          Field: '@/components/BlurDataURLPreview',
        },
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
