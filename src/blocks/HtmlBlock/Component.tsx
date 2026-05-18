import React from 'react'

import type { HtmlBlock as HtmlBlockProps } from '@/payload-types'

type Props = HtmlBlockProps & {
  className?: string
}

export const HtmlBlockComponent: React.FC<Props> = ({ html, className }) => {
  if (!html) return null

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
