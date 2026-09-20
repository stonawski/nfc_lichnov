import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'

const TRANSITION_MS = 320

export function PageMotion({ children }: { children: ReactNode }) {
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)
  const shieldRef = useRef<HTMLDivElement>(null)
  const firstRenderRef = useRef(true)
  const revealTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const nextUrl = new URL(anchor.href, window.location.href)
      if (nextUrl.origin !== window.location.origin) return

      const currentUrl = new URL(window.location.href)
      const sameDocument =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search

      // Hash-only jumps should stay instant and should not trigger a full page transition.
      if (sameDocument) return

      const shield = shieldRef.current
      if (!shield) return

      shield.classList.remove('is-revealing')
      shield.classList.add('is-covering')
      document.documentElement.classList.add('route-changing')
    }

    document.addEventListener('click', handleDocumentClick, true)
    return () => document.removeEventListener('click', handleDocumentClick, true)
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    const shield = shieldRef.current
    if (!root || !shield) return

    // Route changes often happen while the user is deep down the previous page.
    // Reset scroll before paint so the browser never flashes the new page footer.
    const html = document.documentElement
    const previousScrollBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    html.style.scrollBehavior = previousScrollBehavior

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>('main > section, main > article, main > div'),
    )

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      blocks.forEach((block) => block.classList.add('reveal-block', 'is-visible'))
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return

            const element = entry.target as HTMLElement
            element.classList.add('is-visible')
            observer.unobserve(element)
          })
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -7% 0px',
        },
      )

      blocks.forEach((block, index) => {
        block.classList.add('reveal-block')
        block.style.setProperty('--reveal-delay', `${Math.min(index, 2) * 35}ms`)

        // The first screen should already be ready underneath the transition shield.
        if (index === 0) {
          block.classList.add('is-visible')
        } else {
          observer.observe(block)
        }
      })

      if (revealTimerRef.current != null) {
        window.clearTimeout(revealTimerRef.current)
      }

      if (!firstRenderRef.current) {
        shield.classList.add('is-covering')
        document.documentElement.classList.add('route-changing')

        const frame = requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            shield.classList.remove('is-covering')
            shield.classList.add('is-revealing')
          })
        })

        revealTimerRef.current = window.setTimeout(() => {
          shield.classList.remove('is-revealing')
          document.documentElement.classList.remove('route-changing')
        }, TRANSITION_MS)

        firstRenderRef.current = false

        return () => {
          cancelAnimationFrame(frame)
          observer.disconnect()
          if (revealTimerRef.current != null) window.clearTimeout(revealTimerRef.current)
        }
      }

      firstRenderRef.current = false
      document.documentElement.classList.remove('route-changing')

      return () => observer.disconnect()
    }

    if (!firstRenderRef.current) {
      shield.classList.remove('is-covering', 'is-revealing')
      document.documentElement.classList.remove('route-changing')
    }

    firstRenderRef.current = false
  }, [location.pathname, location.search])

  return (
    <>
      <div ref={rootRef} className="page-motion-shell">
        <div key={location.key} className="route-content-enter">
          {children}
        </div>
      </div>
      <div ref={shieldRef} className="route-transition-shield" aria-hidden="true" />
    </>
  )
}
