import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

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

  const mediaCaption = showMediaCaption && typeof media === 'object' ? media?.caption : null

  const sizeStyle: React.CSSProperties = {
    ...(widthPercent != null && { width: `${widthPercent}%` }),
    ...(maxWidth != null && { maxWidth: `${maxWidth}px` }),
  }

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
          />
        </div>
      )}
      {caption && (
        <div className={cn('mt-3 text-center prose md:prose-md dark:prose-invert mx-auto', captionClassName)}>
          <p className="!my-0">{caption}</p>
        </div>
      )}
      {mediaCaption && (
        <RichText
          data={mediaCaption}
          enableGutter={false}
          className={cn('mt-3 text-center', captionClassName)}
        />
      )}
    </div>
  )
}
