import React from 'react'

import { cn } from '@/utilities/ui'
import type { IframeBlock as IframeBlockProps } from '@/payload-types'

type Props = IframeBlockProps & {
  className?: string
}

export const IframeBlockComponent: React.FC<Props> = ({ url, title, height, fullWidth, className }) => {
  if (!url) return null

  return (
    <div className={cn('container', className)}>
      <iframe
        src={url}
        title={title || 'Embedded content'}
        width={fullWidth ? '100%' : undefined}
        height={height ?? 500}
        className="border-0 w-full"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
