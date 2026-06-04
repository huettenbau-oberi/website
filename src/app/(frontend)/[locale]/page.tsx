import PageTemplate, { generateMetadata } from './[slug]/page'

export default PageTemplate

export { generateMetadata }

// Empty: build has no DB; locale roots render on demand at runtime (dynamicParams default = true)
export function generateStaticParams() {
  return []
}
