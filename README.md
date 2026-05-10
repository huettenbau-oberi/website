# Hüttenbau Oberi — Website

<p align="center">
  <img src="/public/images/logo_light.svg" alt="Hüttenbau Oberi" width="180" />
</p>

<p align="center">
  The official website for <strong>Hüttenbau Oberi</strong> — a yearly camp for kids where we build huts together.
  <br/>
  Built with Next.js 16, Payload CMS 3, and PostgreSQL.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Payload-3-blue?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiAyMmgyMEwxMiAyeiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=" alt="Payload" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/i18n-DE%20%2F%20EN-orange" alt="i18n" />
</p>

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| CMS | [Payload 3](https://payloadcms.com) (native Next.js) |
| Database | PostgreSQL 15 via `@payloadcms/db-postgres` |
| Styling | Tailwind CSS + CSS variables (light/dark theme) |
| Animations | Framer Motion 12 |
| i18n | next-intl · locales: **DE** (default) / **EN** |
| Icons | Lucide React |
| UI primitives | Radix UI |

---

## Getting Started

### Local dev (Node)

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env file and fill in the blanks
cp .env.example .env

# 3. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the site and [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS.

### Local dev (Docker)

```bash
# Spin up the app + a local PostgreSQL instance
docker compose up
```

The app runs on port `3000`, Postgres on `5432`.

---

## Environment Variables

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PAYLOAD_SECRET=a-long-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
CRON_SECRET=another-random-secret
PREVIEW_SECRET=yet-another-secret
```

---

## Project Structure

```
src/
├── app/
│   ├── (frontend)/[locale]/   # Public-facing pages (i18n routes)
│   └── (payload)/             # Payload admin panel
├── blocks/
│   └── camp/                  # Page builder blocks
│       ├── CampHero/          # Full-width hero + countdown
│       ├── CampMain/          # Two-column text + image sections
│       ├── CampGallery/       # Asymmetric photo mosaic
│       ├── CampFacts/         # Animated stats bar
│       └── CampSponsors/      # Scattered sponsor logos
├── collections/               # Payload collections (Pages, Posts, Media, Users)
├── heros/                     # Hero variants (Home, High/Low/Medium Impact, Post)
├── providers/                 # Theme, auth context
├── i18n/                      # next-intl config + locale slugs
└── payload.config.ts
```

---

## Page Builder Blocks

All blocks live under **"Hüttenbau Homepage"** in the Payload block picker.

| Block | Description |
|---|---|
| **Camp Hero** | Full-screen hero with title, countdown timer, and CTA buttons |
| **Camp Main** | Alternating two-column text + image layout |
| **Camp Gallery** | 7-slot asymmetric mosaic with decorative icons |
| **Camp Facts** | Taupe stat bar with animated count-up numbers |
| **Camp Sponsors** | Organically scattered sponsor logos with intro/outro text |

---

## Useful Commands

```bash
pnpm dev               # Start dev server
pnpm build             # Production build
pnpm start             # Start production server
pnpm generate:types    # Regenerate Payload TypeScript types
pnpm lint              # Run ESLint
```

---

## Theme

The site ships with a full **light/dark mode** using CSS custom properties. The palette is based on the Hüttenbau Oberi brand:

| Token | Light | Dark |
|---|---|---|
| `--background` | `#FFFCF7` warm white | `#171716` deep black |
| `--primary` | `#EA3936` brand red | `#EA3936` brand red |
| `--muted` | `#E8DDCB` warm beige | `#36231D` warm dark brown |
| `--border` | `#C4B7B1` warm mid-gray | subtle dark border |

The preferred theme is read from `localStorage` on first load via an inline script to avoid flash.
