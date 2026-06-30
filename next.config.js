import { execSync } from 'child_process'
import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

let commitHash = process.env.COMMIT_HASH || ''
if (!commitHash) {
  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim()
  } catch {}
}

let tagVersion = process.env.VERSION || ''
if (!tagVersion) {
  try {
    tagVersion = execSync('git describe --tags --abbrev=0').toString().trim()
  } catch {}
}

const buildVersion = `${tagVersion || 'develop'} - ${commitHash || 'unknown'}`

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    qualities: [75],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
          port: url.port,
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  env: {
    NEXT_PUBLIC_BUILD_VERSION: buildVersion,
  },
  output: 'standalone',
  reactStrictMode: true,
  redirects,
  async rewrites() {
    // Next.js scans public/ once at startup and only serves files present then.
    // Runtime uploads are invisible to that set, causing 404s until restart.
    // beforeFiles routes all /media/* through Payload's file handler instead,
    // which reads from staticDir on every request.
    return {
      beforeFiles: [
        {
          source: '/media/:path*',
          destination: '/api/media/file/:path*',
        },
      ],
    }
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
