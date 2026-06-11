/**
 * Next.js boot hook. Waits for the database, then warms Payload and the
 * Postgres pool so the first user request doesn't pay the cold-init cost.
 *
 * register() runs before Next.js starts handling routes, so waiting here
 * guarantees the DB is reachable before any page render fires.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { getPayload } = await import('payload')
  const configPromise = (await import('@payload-config')).default

  const startedAt = Date.now()
  try {
    const payload = await getPayload({ config: configPromise })

    // Block until the DB accepts queries (up to 60 s). The DB container may
    // start after the app container, so the first few attempts are expected
    // to fail. Without this wait the warmup silently skips, routes open
    // immediately, and the first page render hits an unconnected pool.
    payload.logger.info('Waiting for database…')
    let dbReady = false
    const deadline = Date.now() + 60_000
    while (!dbReady && Date.now() < deadline) {
      try {
        await payload.find({ collection: 'pages', limit: 1, pagination: false, overrideAccess: true })
        dbReady = true
      } catch {
        await new Promise((r) => setTimeout(r, 1_000))
      }
    }
    if (!dbReady) {
      payload.logger.warn('Database not available after 60 s — skipping startup warmup')
      return
    }

    payload.logger.info('Warming Payload — pre-fetching globals')

    // Globals fetched on every render of every page.
    const warmups = (['header', 'footer', 'settings'] as const).map((slug) =>
      payload
        .findGlobal({ slug, depth: 1 })
        .catch((err: Error) => payload.logger.warn(`Warmup skipped for ${slug}: ${err.message}`)),
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
