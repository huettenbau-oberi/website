import PageTemplate, { generateMetadata } from './[slug]/page'

// The build runs without a database, so this route would otherwise be
// statically baked as a 404 (no "home" page found yet) and served forever.
// Unlike [slug] routes, "/" isn't a dynamic param, so it can't fall back to
// on-demand generation — render it per-request instead.
export const dynamic = 'force-dynamic'

export default PageTemplate

export { generateMetadata }
