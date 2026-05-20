import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    categories: [],
  }

  if (categories && Array.isArray(categories) && categories.length > 0) {
    const populatedCategories: { id: string | number; title: string }[] = []
    const idsToFetch: (string | number)[] = []

    for (const category of categories) {
      if (!category) continue
      if (typeof category === 'object') {
        populatedCategories.push(category)
      } else {
        idsToFetch.push(category)
      }
    }

    if (idsToFetch.length > 0) {
      const { docs } = await req.payload.find({
        collection: 'categories',
        where: { id: { in: idsToFetch } },
        depth: 0,
        limit: idsToFetch.length,
        pagination: false,
        select: { title: true },
        req,
      })

      const foundIds = new Set<string | number>(docs.map((d) => d.id))
      for (const missingId of idsToFetch.filter((cid) => !foundIds.has(cid))) {
        console.error(
          `Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search (category id: '${missingId}').`,
        )
      }

      populatedCategories.push(...docs)
    }

    modifiedDoc.categories = populatedCategories.map((each) => ({
      relationTo: 'categories',
      categoryID: String(each.id),
      title: each.title,
    }))
  }

  return modifiedDoc
}
