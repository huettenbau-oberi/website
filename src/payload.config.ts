import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'

// Cap Sharp's libuv worker fan-out so concurrent image uploads / blur-placeholder
// generation can't saturate the VPS — by default Sharp spawns one thread per core.
sharp.concurrency(2)
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { migrations } from './migrations'

import { AuditLogs } from './collections/AuditLogs'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Banner } from './Banner/config'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { systemEndpoints } from './endpoints/system'
import { accountEndpoints } from './endpoints/account'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeDashboard: ['@/components/BeforeDashboard'],
      beforeLogin: ['@/components/BeforeLogin'],
      // Blocks the panel for users an admin has flagged as `twoFactorEnforced` until
      // they finish 2FA enrollment.
      providers: ['@/components/TwoFactorGate'],
      graphics: {
        Logo: '@/graphics/Logo/index.tsx#Logos',
        Icon: '@/graphics/Icon/index.tsx#Icons',
      },
      views: {
        // Custom login view adds the two-step TOTP prompt (native form has no code field).
        login: {
          Component: '@/components/TwoFactorLogin',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    meta: {
      icons: [
        {
          fetchPriority: 'high',
          sizes: '32x32',
          type: 'image/png',
          rel: 'icon',
          url: '/images/icon_dark.png',
        },
        {
          fetchPriority: 'high',
          sizes: '32x32',
          type: 'image/png',
          rel: 'icon',
          url: '/images/icon_light.png',
          media: '(prefers-color-scheme: dark)',
        },
      ],
      titleSuffix: ' - Hüttenbau Admin',
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    prodMigrations: migrations,
  }),
  collections: [Pages, Posts, Media, Categories, Users, AuditLogs],
  endpoints: [...systemEndpoints, ...accountEndpoints],
  cors: [getServerSideURL()].filter(Boolean),
  csrf: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, Settings, Banner],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
