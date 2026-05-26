import React from 'react'
import type { CtaButtonBlock as CtaButtonBlockProps } from '@/payload-types'
import { CMSLink } from '@/components/Link'

const alignClass: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

export const CtaButtonBlockComponent: React.FC<CtaButtonBlockProps> = ({ link, alignment }) => {
  if (!link) return null

  return (
    <div className={`not-prose flex my-4 ${alignClass[alignment ?? 'left'] ?? alignClass.left}`}>
      <CMSLink {...link} />
    </div>
  )
}
