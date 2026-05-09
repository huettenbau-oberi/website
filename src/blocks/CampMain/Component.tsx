import React from 'react'
import { Media } from '@/components/Media'
import type { CampMainBlock as CampMainBlockProps } from '@/payload-types'
import RichText from '@/components/RichText'

export const CampMainBlock: React.FC<CampMainBlockProps> = ({
  richText1,
  image1,
  richText2,
  image2,
}) => {
  const hasImage = image1 && typeof image1 === 'object'

  return (
    <section className="overflow-hidden bg-secondary">
      <div className="container flex flex-col gap-10 pt-16 pb-8 md:flex-row md:items-center md:pt-20 md:pb-12">
        <div className="shrink-0 md:w-1/2">
          {richText1 && <RichText data={richText1} enableGutter={false} />}
        </div>

        {hasImage && (
          <div className="-mr-4 sm:-mr-4 md:-mr-8 md:ml-12 lg:-mr-8 xl:-mr-8 2xl:-mr-8">
            <Media resource={image1} imgClassName="h-auto w-full rounded-lg object-cover" />
          </div>
        )}
      </div>
      <div className="container flex flex-col gap-10 pb-16 md:flex-row md:items-center md:pb-20">
        {hasImage && (
          <div className="-ml-4 sm:-ml-4 md:-ml-8 md:ml-12 lg:-ml-8 xl:-ml-8 2xl:-ml-8">
            <Media resource={image2} imgClassName="h-auto w-full rounded-lg object-cover" />
          </div>
        )}

        <div className="shrink-0 md:w-1/2">
          {richText2 && <RichText data={richText2} enableGutter={false} />}
        </div>
      </div>
    </section>
  )
}
