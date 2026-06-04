/**
 * Next.js boot hook. Warms Payload and the Postgres pool on container start
 * so the first user request doesn't pay the ~5-10 s cold-init cost.
 *
 * Without this, getPayload() is lazily invoked by the first call to
 * getCachedGlobal()/payload.find() — meaning whichever visitor lands first
 * after a deploy waits for schema validation, the first DB connection,
 * Sharp's libvips load (via the rest of the request) and the initial RSC
 * module load to complete sequentially.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { getPayload } = await import('payload')
  const configPromise = (await import('@payload-config')).default

  const startedAt = Date.now()
  try {
    const payload = await getPayload({ config: configPromise })
    payload.logger.info('Warming Payload — instantiating client + pre-fetching globals')

    // Globals fetched on every render of every page, in every supported locale.
    // Pre-fetching opens a DB connection and populates Payload's internal caches
    // so the first request just reads from memory.
    const warmups = (['header', 'footer', 'settings'] as const).flatMap((slug) =>
      (['de', 'en'] as const).map((locale) =>
        payload
          .findGlobal({ slug, depth: 1, locale })
          .catch((err: Error) =>
            payload.logger.warn(`Warmup skipped for ${slug}/${locale}: ${err.message}`),
          ),
      ),
    )

    await Promise.all(warmups)
    payload.logger.info(`Payload warm in ${Date.now() - startedAt}ms`)

    // Revalidate all published pages so stale ISR cache from build time is cleared.
    // Runs after warmup so the DB connection is already open.
    try {
      const { revalidatePath, revalidateTag } = await import('next/cache')
      const { getPagePaths } = await import(
        './collections/Pages/hooks/revalidatePage'
      )

      const pages = await payload.find({
        collection: 'pages',
        draft: false,
        overrideAccess: false,
        limit: 1000,
        pagination: false,
        select: { slug: true },
      })

      pages.docs.forEach(({ slug }) => {
        getPagePaths(slug).forEach((path) => revalidatePath(path))
      })
      revalidateTag('pages-sitemap', 'default')
      payload.logger.info(`Revalidated ${pages.docs.length} pages on startup`)
    } catch (err) {
      payload.logger.warn(`Startup revalidation failed: ${(err as Error).message}`)
    }
  } catch (err) {
    // Best-effort — a failed warmup must not prevent the server from booting.
    // The first user request will then fall back to a cold init.
    console.error('Payload warmup failed:', err)
  }
}
