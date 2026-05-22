import type { Category, Post } from '@/payload-types'

type PostLike = {
  slug?: string | null
  categories?: (string | number | Category)[] | null
}

export function getPostUrl(post: PostLike): string {
  const categories = post.categories ?? []
  for (const category of categories) {
    if (typeof category === 'object' && category.urlPrefix) {
      return `/${category.urlPrefix}/${post.slug}`
    }
  }
  return `/posts/${post.slug}`
}

export function getUrlPrefixFromCategories(
  categories: (string | number | Category)[] | null | undefined,
): string {
  if (!categories) return 'posts'
  for (const category of categories) {
    if (typeof category === 'object' && category.urlPrefix) {
      return category.urlPrefix
    }
  }
  return 'posts'
}
