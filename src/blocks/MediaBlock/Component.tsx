import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

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

  const showCaptionOverlay = !!(showMediaCaption && typeof media === 'object' && media?.caption)

  const sizeStyle: React.CSSProperties = {
    ...(widthPercent != null && { width: `${widthPercent}%` }),
    ...(maxWidth != null && { maxWidth: `${maxWidth}px` }),
  }

  // Tell the browser how wide the image will actually render so Next.js can pick the
  // smallest matching srcset variant. Without this hint, the default sizes assumes
  // 100vw and Next serves the largest variant — easily 1MB+ for a half-width image.
  const vw = widthPercent != null ? `${widthPercent}vw` : '100vw'
  const mediaSize =
    maxWidth != null
      ? widthPercent != null
        ? `min(${vw}, ${maxWidth}px)`
        : `min(100vw, ${maxWidth}px)`
      : widthPercent != null
        ? vw
        : undefined

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
            imgClassName={cn('border border-border rounded-[0.8rem] max-w-full h-auto', imgClassName)}
            resource={media}
            src={staticImage}
            showCaption={showCaptionOverlay}
            size={mediaSize}
            enableZoom
          />
        </div>
      )}
      {caption && (
        <div className={cn('mt-3 text-center prose md:prose-md dark:prose-invert mx-auto', captionClassName)}>
          <p className="!my-0">{caption}</p>
        </div>
      )}
    </div>
  )
}
