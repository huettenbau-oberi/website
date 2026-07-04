import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { CampFactsBlock } from '@/blocks/camp/CampFacts/Component'
import { CampSponsorsBlock } from '@/blocks/camp/CampSponsors/Component'
import { CampGalleryBlock } from '@/blocks/camp/CampGallery/Component'
import { CampHeroBlock } from '@/blocks/camp/CampHero/Component'
import { CampMainBlock } from '@/blocks/camp/CampMain/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { HtmlBlockComponent } from '@/blocks/HtmlBlock/Component'
import { IframeBlockComponent } from '@/blocks/IframeBlock/Component'
import { GalleryTimelineBlock } from '@/blocks/GalleryTimeline/Component'
import { PostSectionBlock } from '@/blocks/PostSection/Component'
import { GalleryGridBlock } from '@/blocks/GalleryGrid/Component'
import { InArbeitBlockComponent } from '@/blocks/InArbeit/Component'

const blockComponents = {
  campFacts: CampFactsBlock,
  campSponsors: CampSponsorsBlock,
  campGallery: CampGalleryBlock,
  campHero: CampHeroBlock,
  campMain: CampMainBlock,
  content: ContentBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  htmlBlock: HtmlBlockComponent,
  iframeBlock: IframeBlockComponent,
  galleryTimeline: GalleryTimelineBlock,
  postSection: PostSectionBlock,
  galleryGrid: GalleryGridBlock,
  inArbeit: InArbeitBlockComponent,
}

export const RenderBlocks: React.FC<{
  blocks: NonNullable<Page['layout']>[0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
