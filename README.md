# VÉLORA — Premium Fitness & Lifestyle Product Discovery

VÉLORA is a premium affiliate product discovery site for fitness & lifestyle (US audience, American English, women-first).
It curates the best fitness products from merchants like Amazon, Temu, and AliExpress — with editorial reviews, buying guides,
comparisons, and trend tracking.

## Tech stack

- **Framework:** Next.js 14.2 (App Router), React 18, TypeScript 5 (strict)
- **Styling:** Tailwind CSS 3.4 (luxury editorial design tokens)
- **Database:** PostgreSQL via Prisma 5.22 (@prisma/client + prisma CLI)
- **Auth:** bcryptjs password hashing + jose-signed admin session tokens
- **Validation:** zod
- **Seed runner:** tsx

## Prerequisites

- Node.js 18.17+ (20.x recommended)
- A PostgreSQL database — [Neon](https://neon.tech) or [Supabase](https://supabase.com) recommended (pooled connection)

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL, ADMIN_EMAIL,
# ADMIN_PASSWORD_HASH, and SESSION_SECRET (see .env.example).

# 3. Generate the Prisma client (also runs automatically post-install)
npm run prisma:generate

# 4. Create the database schema
#    Point DATABASE_URL at your Neon/Supabase pooled URL first.
npm run prisma:migrate

# 5. Seed structural data (categories, merchants, site settings, optional admin)
npm run prisma:seed

# 6. Start the dev server
npm run dev
# → http://localhost:3000
```

## Generating the admin password hash

The seed creates an admin user only if `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` are set.
Generate the hash with bcryptjs:

```bash
node -e "const b=require('bcryptjs'); b.hash('YOUR_STRONG_PASSWORD', 10).then(h => console.log(h))"
```

Copy the output into `ADMIN_PASSWORD_HASH` in `.env`, then run `npm run prisma:seed`.

## GitHub push

```bash
git init
git add .
git commit -m "VÉLORA scaffold: config, data layer, seed"
git branch -M main
git remote add origin git@github.com:YOUR_ORG/velora.git
git push -u origin main
```

Never commit `.env` files — they are gitignored. Use `.env.example` as the template.

## Vercel deployment

1. Import the GitHub repo in the Vercel dashboard (`Add New → Project`).
2. Framework preset: **Next.js** (auto-detected).
3. Add the required environment variables (see table below) to **Project Settings → Environment Variables**.
4. Deploy. On first deploy, apply the database schema from your machine:

   ```bash
   # point DIRECT_URL at the unpooled database URL, then:
   npx prisma migrate deploy
   ```

### Required env vars

| Variable               | Required | Notes                                                      |
| ---------------------- | -------- | ---------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | Pooled Neon/Supabase connection string (Prisma runtime)    |
| `DIRECT_URL`           | No       | Unpooled URL for `prisma migrate deploy`                   |
| `ADMIN_EMAIL`          | Yes      | First admin login email                                    |
| `ADMIN_PASSWORD_HASH`  | Yes      | bcrypt hash (see above) — used once by the seed            |
| `SESSION_SECRET`       | Yes      | `openssl rand -base64 32` — signs admin session tokens     |
| `NEXT_PUBLIC_SITE_URL` | Yes      | Canonical site URL, e.g. `https://velora.vercel.app`       |
| `NEXT_PUBLIC_SITE_NAME`| No       | Defaults to `VÉLORA`                                       |

## Project structure

```
velora/
├── prisma/
│   ├── schema.prisma      # PostgreSQL data model (see "Data model" below)
│   └── seed.ts            # Idempotent structural seed (categories, merchants, settings)
├── public/
│   └── images/            # Brand PNGs (hero, logo, category art)
├── src/
│   ├── app/
│   │   ├── layout.tsx     # Minimal root layout (fonts: Cormorant Garamond + Inter)
│   │   └── globals.css    # Tailwind, CSS vars, base + article-body editorial styles
│   └── lib/
│       ├── db.ts          # PrismaClient singleton (globalThis guard)
│       ├── site.ts        # Site config from env + absoluteUrl/canonical helpers
│       └── utils.ts       # cx, formatPrice, slugify, truncate, discountPercent
├── .env.example           # Every supported env var, documented
├── next.config.mjs        # Affiliate-media remotePatterns (amazon/temu/aliexpress)
├── tailwind.config.ts     # Luxury editorial tokens (ink/coal/cream/sand/gold)
└── tsconfig.json          # Strict TS, @/* → ./src/* alias
```

## Admin panel

The admin panel lives at **`/admin`** (sign in with `ADMIN_EMAIL` / the password behind the hash).

## Data model (Prisma)

**Enums:** `Gender` (WOMEN, MEN, UNISEX), `ProductStatus` (DRAFT, PENDING, PUBLISHED, ARCHIVED),
`TrendStatus` (DISCOVERED, IN_REVIEW, APPROVED, FEATURED, PUBLISHED, REJECTED, ARCHIVED),
`DataSource` (VERIFIED, MERCHANT_SUPPLIED, EDITORIAL, AI_SUGGESTED, UNAVAILABLE),
`ArticleType` (ARTICLE, BUYING_GUIDE, REVIEW, COMPARISON, ROUNDUP, TREND),
`ArticleStatus` (DRAFT, PUBLISHED, ARCHIVED).

**Models:** `Category` (self-parented subcategories), `Merchant`, `Product`,
`ProductImage`, `ProductAttribute`, `ProductTag`, `Author`, `Article`, `Comparison`,
`Review`, `TrendSignal`, `ClickEvent` (no IP storage), `AnalyticsEvent`,
`NewsletterSubscriber`, `AdminUser`, `SiteSetting`.

Indexed: `Product.slug`, `Product.status`, `Product.categoryId`, `Article.slug`,
`Article.status`, `Category.slug`, `ClickEvent.createdAt`.

## Notes

- **No fake product data policy:** the seed deliberately adds zero products and zero articles.
  All catalog and editorial content is added by real curators via `/admin`.
- Affiliate links carry `trackingConfig` per merchant; click events record page/referrer/campaign —
  never IPs.
- TypeScript is strict; `npm run lint` must pass before pushing.
