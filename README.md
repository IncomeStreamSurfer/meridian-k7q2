# Meridian — Specialty Coffee Coming Soon

An editorial coming-soon landing page for a specialty coffee brand. Three pages, dark/light editorial aesthetic, email capture wired to a real backend.

## Stack

- **Astro 5** with the Vercel adapter (server output)
- **Tailwind v4** via `@tailwindcss/vite`
- **Resend** — waitlist contact storage (audience) + welcome email
- **Supabase** — schema is shipped in `supabase/migrations/0001_init.sql` and the
  API route falls through to it automatically once the env vars are set
- **@astrojs/sitemap** — auto-generated `/sitemap-index.xml`

## Pages

- `/` — Hero, story, sourcing, what-you-get, final CTA, two waitlist forms
- `/about` — Long-form brand story (5 chapters, ~800 words)
- `/thanks` — Post-signup confirmation with what-happens-next + share

## Email capture flow

`POST /api/subscribe` accepts `{ email }` (JSON or form-encoded). It:

1. Validates the email and runs a honeypot check.
2. Tries to insert into `waitlist_signups` if Supabase env vars are set.
3. Always syncs the contact to a Resend audience (the primary store while
   Supabase invoices are being settled — see "Note" below).
4. Fires a Meridian-branded welcome email via Resend.

The form lives in `src/components/WaitlistForm.astro` and is reused on `/`
in two places (hero and footer CTA).

## SEO

Every page ships with:

- Title, meta description, canonical, OG, Twitter card, favicon
- JSON-LD structured data (Organization + WebSite on `/`, AboutPage +
  Organization + BreadcrumbList on `/about`, WebPage + BreadcrumbList on
  `/thanks`)
- `robots.txt` referencing the sitemap
- `@astrojs/sitemap` integration → `/sitemap-index.xml`

## Local development

```bash
cp .env.example .env
# fill in RESEND_API_KEY (and optionally Supabase) at minimum
npm install --legacy-peer-deps
npm run dev
```

## Deploy

This repo is wired for Vercel. The build deploys automatically on push to
`main`. Required env vars on Vercel:

- `PUBLIC_SITE_URL`
- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`
- (Optional) `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`

## Note on Supabase

A Supabase project couldn't be auto-provisioned on initial build because the
connected organisation has overdue invoices. The schema is fully written
in `supabase/migrations/0001_init.sql` — once invoices are settled:

1. Create a new Supabase project.
2. Open the SQL editor and paste the contents of the migration.
3. Add the three `*_SUPABASE_*` env vars to Vercel.
4. Redeploy. The `/api/subscribe` route will automatically start mirroring
   signups into `waitlist_signups` alongside Resend.

## Harbor hook

The `content` table in the migration is reserved for future article
publishing by Harbor's Writer tool — leave it in place even though no
blog index is rendered on this site.

## What's next

- Hook up a custom domain in Vercel (Project → Settings → Domains).
- Verify a sending domain in Resend so the welcome email comes from
  `hello@meridiancoffee.co` (or similar) instead of `onboarding@resend.dev`.
- Apply the Supabase migration once invoices are settled.
- Once you have a real OG image, drop it at `public/og-default.png`.

© 2026 Meridian Coffee Co.
