# NFC Lichnov — launch checklist

This checklist is the final gate before the new public website replaces the legacy site.

## Application and build

- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run build` succeeds with production environment variables.
- [ ] GitHub Actions CI is green on `main`.
- [ ] Review the current two moderate npm audit findings before launch; do not use `npm audit fix --force` without checking the breaking upgrade.
- [ ] Test the production build with `npm run preview`.
- [ ] Verify direct navigation and refresh on nested routes such as `/tymy/muzi`, `/zapasy/:id` and `/aktuality/:slug`.

## Production environment

- [ ] Set `VITE_SUPABASE_URL`.
- [ ] Set `VITE_SUPABASE_ANON_KEY`.
- [ ] Set `VITE_SITE_URL` to the final HTTPS origin without a trailing slash.
- [ ] Confirm no service-role key or Cloudflare secret is exposed to the browser bundle.
- [ ] Verify Supabase project URL and allowed redirect URLs for production.

## Supabase

- [ ] Apply all migrations, including `20260922083000_club_stats.sql`.
- [ ] Verify public read RLS for published public content.
- [ ] Verify editor write RLS through `can_edit_content()`.
- [ ] Verify audit/last-edit tables are not readable anonymously.
- [ ] Test login, logout and a forbidden non-editor account.
- [ ] Test one create/update/delete flow for news, gallery, player, staff and historical statistics.
- [ ] Create a database backup before launch.

## Cloudflare R2 and media

- [ ] Verify production CORS allows the final website origin.
- [ ] Verify `media-upload-url`, `gallery-upload-url` and `media-delete` Edge Functions.
- [ ] Upload and delete a test image from production admin.
- [ ] Confirm old replaced media is removed from R2 where expected.
- [ ] Check large photos on mobile data and optimize source files if needed.

## SEO and indexing

- [ ] Confirm page titles/descriptions/canonical URLs on the production domain.
- [ ] Confirm article/gallery/team/match detail metadata.
- [ ] Confirm `robots.txt` disallows `/admin/`.
- [ ] Confirm `sitemap.xml` exists after build with `VITE_SITE_URL` set.
- [ ] Submit the sitemap to Google Search Console after launch.
- [ ] Decide how the legacy `nfclichnov.wbs.cz` site will point users/search engines to the new website.
- [ ] Add permanent redirects for old URLs where the hosting platform allows it.
- [ ] Verify social sharing previews for homepage and at least one article.
- [ ] If the hosting/social crawler does not execute client-side JavaScript, add prerender/SSR/edge metadata for dynamic article, gallery, team and match URLs before relying on rich link previews.

## Responsive and accessibility QA

- [ ] Test 320 px, 375 px, 430 px, tablet portrait, tablet landscape and desktop widths.
- [ ] Check all hero sections, navigation, footer, carousels and horizontal tables.
- [ ] Navigate the public website using keyboard only.
- [ ] Navigate the admin using keyboard only.
- [ ] Verify visible focus styles and the “Přeskočit na obsah” link.
- [ ] Verify mobile menus close with Escape and do not leave background scrolling enabled.
- [ ] Test gallery lightbox controls with keyboard.
- [ ] Check meaningful images have alt text and decorative images use empty alt text.
- [ ] Check the site with reduced motion enabled.

## Content

- [ ] Review club address, contacts and social links.
- [ ] Review current season labels and competition names.
- [ ] Publish at least one real news article or intentionally keep the designed empty state.
- [ ] Publish at least one gallery or intentionally keep the designed empty state.
- [ ] Review historical statistics rows marked “Ke kontrole”.
- [ ] Verify current A-team player links and active flags.

## Domain and launch

- [ ] Configure the production domain and HTTPS.
- [ ] Configure SPA fallback/rewrite to `index.html` for client-side routes.
- [ ] Verify `www` vs apex canonical redirect.
- [ ] Verify HTTPS redirect.
- [ ] Test the site in Chrome, Safari and Firefox.
- [ ] Test one iPhone/iPad and one Android device if available.
- [ ] After DNS cutover, repeat login, media upload, public data and direct-route refresh checks.
- [ ] Decide whether analytics is needed and, if enabled, verify consent/privacy requirements before adding a provider.

## Monitoring after launch

- [ ] Watch browser console/network errors during the first production session.
- [ ] Check Supabase logs for RLS/auth errors.
- [ ] Check Edge Function logs for upload/delete errors.
- [ ] Check Search Console indexing after the sitemap is submitted.
- [ ] Keep the previous site/backups available until the new site has been stable for several days.
