import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || '')
  .trim()
  .replace(/\/+$/, '')

const distDir = resolve(process.cwd(), 'dist')
await mkdir(distDir, { recursive: true })

const robots = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  ...(siteUrl ? ['', `Sitemap: ${siteUrl}/sitemap.xml`] : []),
  '',
].join('\n')

await writeFile(resolve(distDir, 'robots.txt'), robots, 'utf8')

if (!siteUrl) {
  await rm(resolve(distDir, 'sitemap.xml'), { force: true })
  console.log('SEO: VITE_SITE_URL is not set; sitemap.xml was skipped.')
  process.exit(0)
}

const routes = [
  '/',
  '/tymy',
  '/zapasy',
  '/aktuality',
  '/galerie',
  '/klub',
  '/klub/historie',
  '/klub/statistiky',
  '/klub/areal',
  '/kontakt',
]

const urls = routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

await writeFile(resolve(distDir, 'sitemap.xml'), sitemap, 'utf8')
console.log(`SEO: generated sitemap for ${siteUrl}`)
