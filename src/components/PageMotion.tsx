import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const EXIT_MS = 190
const ENTER_MS = 560

export function PageMotion({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigateTimerRef = useRef<number | null>(null)
  const enterTimerRef = useRef<number | null>(null)

  navigateRef.current = navigate

  const clearTimer = (timer: { current: number | null }) => {
    if (timer.current == null) return
    window.clearTimeout(timer.current)
    timer.current = null
  }

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
      const sameRoute = nextUrl.pathname === currentUrl.pathname

      // Query/hash-only changes are UI state, not a new page. Let React Router
      // update the current screen without the global leave/enter transition.
      if (sameRoute) return

      const root = rootRef.current
      if (!root) return

      event.preventDefault()
      clearTimer(navigateTimerRef)

      root.classList.add('is-leaving')
      document.documentElement.classList.add('route-changing')

      const targetPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`

      navigateTimerRef.current = window.setTimeout(() => {
        navigateTimerRef.current = null
        navigateRef.current(targetPath)
      }, EXIT_MS)
    }

    document.addEventListener('click', handleDocumentClick, true)

    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
      clearTimer(navigateTimerRef)
      clearTimer(enterTimerRef)
      document.documentElement.classList.remove('route-changing')
    }
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    root.classList.remove('is-leaving')

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
      block.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 70}ms`)
    })

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      blocks.forEach((block) => block.classList.add('is-visible'))
      document.documentElement.classList.remove('route-changing')
      return
    }

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
        rootMargin: '0px 0px -8% 0px',
      },
    )

    // The first viewport fades in as one stable layout. Following sections reveal on scroll.
    requestAnimationFrame(() => {
      blocks[0]?.classList.add('is-visible')
    })
    blocks.slice(1).forEach((block) => observer.observe(block))

    clearTimer(enterTimerRef)
    enterTimerRef.current = window.setTimeout(() => {
      enterTimerRef.current = null
      document.documentElement.classList.remove('route-changing')
    }, ENTER_MS)

    return () => {
      observer.disconnect()
      clearTimer(enterTimerRef)
    }
  }, [location.pathname])

  return (
    <div ref={rootRef} className="page-motion-shell">
      <div key={location.pathname} className="route-content-enter">
        {children}
      </div>
    </div>
  )
}
