import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const COVER_MS = 180
const SETTLE_MS = 220
const REVEAL_MS = 480

export function PageMotion({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const shieldRef = useRef<HTMLDivElement>(null)
  const firstRenderRef = useRef(true)
  const navigateTimerRef = useRef<number | null>(null)
  const revealTimerRef = useRef<number | null>(null)
  const cleanupTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const clearTransitionTimers = () => {
      if (navigateTimerRef.current != null) window.clearTimeout(navigateTimerRef.current)
      if (revealTimerRef.current != null) window.clearTimeout(revealTimerRef.current)
      if (cleanupTimerRef.current != null) window.clearTimeout(cleanupTimerRef.current)
    }

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
      if (
        !anchor ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        anchor.dataset.noTransition === 'true'
      ) {
        return
      }

      const nextUrl = new URL(anchor.href, window.location.href)
      if (nextUrl.origin !== window.location.origin) return

      const currentUrl = new URL(window.location.href)
      const sameDocument =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search

      // Hash-only jumps keep their native behaviour.
      if (sameDocument) return

      const shield = shieldRef.current
      if (!shield) return

      event.preventDefault()
      clearTransitionTimers()

      shield.classList.remove('is-revealing')
      shield.classList.add('is-covering')
      document.documentElement.classList.add('route-changing')

      const targetPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`

      // Let the outgoing page disappear first. Only then swap the route.
      navigateTimerRef.current = window.setTimeout(() => {
        navigate(targetPath)
      }, COVER_MS)
    }

    document.addEventListener('click', handleDocumentClick, true)

    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
      clearTransitionTimers()
    }
  }, [navigate])

  useLayoutEffect(() => {
    const root = rootRef.current
    const shield = shieldRef.current
    if (!root || !shield) return

    const html = document.documentElement
    const previousScrollBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    html.style.scrollBehavior = previousScrollBehavior

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>('main > section, main > article, main > div'),
    )

    blocks.forEach((block, index) => {
      block.classList.add('reveal-block')
      block.classList.remove('is-visible')
      block.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 65}ms`)
    })

    let observer: IntersectionObserver | null = null

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      blocks.forEach((block) => block.classList.add('is-visible'))
      shield.classList.remove('is-covering', 'is-revealing')
      document.documentElement.classList.remove('route-changing')
      firstRenderRef.current = false
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const element = entry.target as HTMLElement
          element.classList.add('is-visible')
          observer?.unobserve(element)
        })
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    blocks.slice(1).forEach((block) => observer?.observe(block))

    if (revealTimerRef.current != null) window.clearTimeout(revealTimerRef.current)
    if (cleanupTimerRef.current != null) window.clearTimeout(cleanupTimerRef.current)

    if (firstRenderRef.current) {
      blocks[0]?.classList.add('is-visible')
      firstRenderRef.current = false
      document.documentElement.classList.remove('route-changing')

      return () => observer?.disconnect()
    }

    // Keep the viewport covered for a short beat while the new route mounts,
    // its queries enter loading states and the first layout settles.
    shield.classList.remove('is-revealing')
    shield.classList.add('is-covering')
    document.documentElement.classList.add('route-changing')

    revealTimerRef.current = window.setTimeout(() => {
      blocks[0]?.classList.add('is-visible')
      shield.classList.remove('is-covering')
      shield.classList.add('is-revealing')
    }, SETTLE_MS)

    cleanupTimerRef.current = window.setTimeout(() => {
      shield.classList.remove('is-revealing')
      document.documentElement.classList.remove('route-changing')
    }, SETTLE_MS + REVEAL_MS)

    return () => {
      observer?.disconnect()
      if (revealTimerRef.current != null) window.clearTimeout(revealTimerRef.current)
      if (cleanupTimerRef.current != null) window.clearTimeout(cleanupTimerRef.current)
    }
  }, [location.key])

  return (
    <>
      <div ref={rootRef} className="page-motion-shell">
        <div key={location.key} className="route-content-enter">
          {children}
        </div>
      </div>
      <div ref={shieldRef} className="route-transition-shield" aria-hidden="true">
        <div className="route-transition-mark" />
      </div>
    </>
  )
}
