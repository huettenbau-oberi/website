import React from 'react'
import { useTranslations } from 'next-intl'

import { NotFoundContent } from '@/components/NotFoundContent'

export default function NotFound() {
  const t = useTranslations()

  return (
    <NotFoundContent
      title={t('not-found-title')}
      description={t('not-found-description')}
      homeLabel={t('not-found-home')}
      galleryLabel={t('not-found-gallery')}
    />
  )
}
