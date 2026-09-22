import { useEffect } from 'react'

const DEFAULT_TITLE = 'NFC Lichnov'
const DEFAULT_DESCRIPTION =
  'Oficiální web NFC Lichnov — výsledky, zápasy, týmy, aktuality, galerie a život klubu.'

function absoluteUrl(value: string | undefined, base: string) {
  if (!value) return undefined
  try {
    return new URL(value, base).toString()
  } catch {
    return undefined
  }
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value))
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = '/hero-lichnov-field.webp',
  canonicalPath,
  type = 'website',
  noindex = false,
}: {
  title?: string
  description?: string
  image?: string | null
  canonicalPath?: string
  type?: 'website' | 'article'
  noindex?: boolean
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim()
    const siteUrl = configuredSiteUrl || window.location.origin
    const canonicalUrl = absoluteUrl(canonicalPath || window.location.pathname, siteUrl)
    const imageUrl = image ? absoluteUrl(image, siteUrl) : undefined

    document.title = fullTitle

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow',
    })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'cs_CZ' })
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: DEFAULT_TITLE,
    })
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: imageUrl ? 'summary_large_image' : 'summary',
    })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })

    if (canonicalUrl) {
      upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = canonicalUrl
    }

    if (imageUrl) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })
    }
  }, [canonicalPath, description, image, noindex, title, type])

  return null
}
