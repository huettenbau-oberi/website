import React, { Fragment } from 'react'

import type { Props } from './types'

import RichText from '@/components/RichText'
import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource, showCaption } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  const caption =
    showCaption && typeof resource === 'object' && resource !== null
      ? (resource.caption ?? null)
      : null

  const mediaEl = isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />

  return (
    <Tag {...(htmlElement !== null ? { className } : {})}>
      {caption ? (
        <div className="relative">
          {mediaEl}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-4 md:px-6 md:py-5">
            <RichText
              data={caption}
              enableGutter={false}
              enableProse={false}
              className="text-white/75 text-[0.6rem] tracking-[0.18em] uppercase font-semibold font-sans"
            />
          </div>
        </div>
      ) : (
        mediaEl
      )}
    </Tag>
  )
}
