import { useEffect } from 'react'

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (
      callback: () => void,
      options?: { timeout: number },
    ) => number
    cancelIdleCallback?: (handle: number) => void
  }

function warmPath(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  const section = parts[0]

  if (pathname === '/tymy') return import('../pages/TeamsPage')
  if (section === 'tymy' && parts.length > 1) return import('../pages/TeamPage')

  if (pathname === '/zapasy') return import('../pages/MatchesPage')
  if (section === 'zapasy' && parts.length > 1) return import('../pages/MatchDetailPage')

  if (pathname === '/aktuality') return import('../pages/NewsPage')
  if (section === 'aktuality' && parts.length > 1) return import('../pages/NewsDetailPage')

  if (section === 'galerie') return import('../pages/GalleryPage')
  if (pathname === '/klub/statistiky') return import('../pages/ClubStatsPage')
  if (section === 'klub' || pathname === '/kontakt') return import('../pages/StaticPages')

  return Promise.resolve()
}

export function PublicRouteWarmup() {
  useEffect(() => {
    const resolveInternalPath = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null

      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return null
      }

      const url = new URL(anchor.href, window.location.href)
      return url.origin === window.location.origin ? url.pathname : null
    }

    const warmFromIntent = (event: Event) => {
      const pathname = resolveInternalPath(event.target)
      if (!pathname || pathname === window.location.pathname) return
      void warmPath(pathname)
    }

    document.addEventListener('pointerover', warmFromIntent, { passive: true })
    document.addEventListener('focusin', warmFromIntent)
    document.addEventListener('touchstart', warmFromIntent, { passive: true })

    const warmCommonRoutes = () => {
      void Promise.allSettled([
        import('../pages/TeamsPage'),
        import('../pages/MatchesPage'),
        import('../pages/NewsPage'),
        import('../pages/GalleryPage'),
        import('../pages/StaticPages'),
      ])
    }

    const idleWindow = window as IdleWindow
    let idleHandle: number | null = null
    let timeoutHandle: number | null = null

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(warmCommonRoutes, { timeout: 2500 })
    } else {
      timeoutHandle = window.setTimeout(warmCommonRoutes, 1600)
    }

    return () => {
      document.removeEventListener('pointerover', warmFromIntent)
      document.removeEventListener('focusin', warmFromIntent)
      document.removeEventListener('touchstart', warmFromIntent)

      if (idleHandle != null && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle)
      }
      if (timeoutHandle != null) {
        window.clearTimeout(timeoutHandle)
      }
    }
  }, [])

  return null
}
