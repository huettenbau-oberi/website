import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Inter, Playfair_Display } from 'next/font/google'
import React from 'react'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['900'],
  variable: '--font-playfair',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inter',
})

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { TypedLocale } from 'payload'
import { getMessages, setRequestLocale } from 'next-intl/server'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params

  if (!routing.locales.includes(localeParam as TypedLocale)) {
    return notFound()
  }

  const locale = localeParam as TypedLocale
  setRequestLocale(locale)
  const message = await getMessages()

  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        playfairDisplay.variable,
        inter.variable,
      )}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/images/icon_dark.png" rel="icon" sizes="32x32" type="image/png" />
        <link
          href="/images/icon_light.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
          media="(prefers-color-scheme: dark)"
        />
        {process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
        {process.env.NEXT_PUBLIC_UMAMI_RECORDER_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src={process.env.NEXT_PUBLIC_UMAMI_RECORDER_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            data-sample-rate="0.15"
            data-mask-level="moderate"
            data-max-duration="300000"
          ></script>
        )}
      </head>
      <body>
        <NextIntlClientProvider messages={message}>
          <Providers>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
