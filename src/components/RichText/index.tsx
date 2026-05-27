import { CtaButtonBlockComponent } from '@/blocks/CtaButton/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { HtmlBlockComponent } from '@/blocks/HtmlBlock/Component'
import { IframeBlockComponent } from '@/blocks/IframeBlock/Component'
import { GalleryGridBlock } from '@/blocks/GalleryGrid/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'
import { HeadingAnchor } from './HeadingAnchor'

import type {
  CtaButtonBlock as CtaButtonBlockProps,
  HtmlBlock as HtmlBlockProps,
  IframeBlock as IframeBlockProps,
  MediaBlock as MediaBlockProps,
  GalleryGridBlock as GalleryGridBlockProps,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { getPostUrl } from '@/utilities/getPostUrl'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CtaButtonBlockProps | MediaBlockProps | IframeBlockProps | HtmlBlockProps | GalleryGridBlockProps>

function extractNodeText(nodes: any[]): string {
  return nodes
    .flatMap((n) => {
      if (n.type === 'text') return [n.text ?? '']
      if (Array.isArray(n.children)) return [extractNodeText(n.children)]
      return []
    })
    .join('')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? getPostUrl(value as any) : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  heading: ({ node, nodesToJSX }) => {
    const tag = node.tag
    const children = nodesToJSX({ nodes: node.children })
    if (tag === 'h1') return <h1>{children}</h1>
    const id = slugify(extractNodeText(node.children as any[]))
    return (
      <HeadingAnchor key={id} tag={tag} id={id}>
        {children}
      </HeadingAnchor>
    )
  },
  blocks: {
    ctaButton: ({ node }) => <CtaButtonBlockComponent {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0 border-0 rounded-none"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    htmlBlock: ({ node }) => <HtmlBlockComponent {...node.fields} />,
    iframeBlock: ({ node }) => <IframeBlockComponent {...node.fields} />,
    galleryGrid: ({ node }) => (
      <div className="not-prose">
        <GalleryGridBlock {...node.fields} />
      </div>
    ),
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
