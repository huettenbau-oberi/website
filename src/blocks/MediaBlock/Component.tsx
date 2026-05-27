'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React, { useState } from 'react'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'
import RichText from '@/components/RichText'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
    widthPercent,
    maxWidth,
    caption,
    showMediaCaption,
  } = props

  const mediaCaption =
    showMediaCaption && typeof media === 'object' && media?.caption ? media.caption : null

  // For images, use stored dimensions. For videos (no stored dims), detect portrait client-side.
  const mediaW = typeof media === 'object' && media ? media.width : null
  const mediaH = typeof media === 'object' && media ? media.height : null
  const storedIsPortrait = mediaW != null && mediaH != null && mediaH > mediaW

  const [videoPortrait, setVideoPortrait] = useState(false)
  const isVideo = typeof media === 'object' && media?.mimeType?.includes('video')
  const isPortrait = isVideo ? videoPortrait : storedIsPortrait

  // Editor-set maxWidth always wins; otherwise cap at 600px portrait, 800px landscape.
  const effectiveMaxWidth = maxWidth ?? (isPortrait ? 480 : 650)

  const sizeStyle: React.CSSProperties = {
    ...(widthPercent != null && { width: `${widthPercent}%` }),
    maxWidth: `${effectiveMaxWidth}px`,
  }

  // Tell the browser how wide the image will actually render so Next.js can pick the
  // smallest matching srcset variant. Without this hint, the default sizes assumes
  // 100vw and Next serves the largest variant — easily 1MB+ for a half-width image.
  const vw = widthPercent != null ? `${widthPercent}vw` : '100vw'
  const mediaSize =
    widthPercent != null
      ? `min(${vw}, ${effectiveMaxWidth}px)`
      : `min(100vw, ${effectiveMaxWidth}px)`

  return (
    <div
      className={cn(
        '',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      {(media || staticImage) && (
        <div style={sizeStyle} className="mx-auto flex justify-center">
          <Media
            imgClassName={cn('border border-border max-w-full h-auto', imgClassName)}
            resource={media}
            src={staticImage}
            size={mediaSize}
            enableZoom
            onVideoMeta={(w, h) => {
              if (!maxWidth) setVideoPortrait(h > w)
            }}
          />
        </div>
      )}
      {mediaCaption && (
        <RichText
          data={mediaCaption}
          enableGutter={false}
          enableProse={false}
          className={cn(
            'mt-2 text-center text-[0.65rem] tracking-wide text-muted-foreground mx-auto [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary/80',
            captionClassName,
          )}
        />
      )}
      {caption && (
        <RichText
          data={caption}
          enableGutter={false}
          enableProse={false}
          className={cn(
            'mt-2 text-center text-[0.65rem] tracking-wide text-muted-foreground mx-auto [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary/80',
            captionClassName,
          )}
        />
      )}
    </div>
  )
}
