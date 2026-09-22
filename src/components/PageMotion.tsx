import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'

const FALLBACK_EXIT_MS = 280
const ENTER_MS = 760

type ViewTransition = {
  finished: Promise<void>
}

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => ViewTransition
}

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

      // Query/hash changes are component state, not a page transition.
      if (sameRoute) return

      const root = rootRef.current
      if (!root) return

      event.preventDefault()
      clearTimer(navigateTimerRef)

      const targetPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const transitionDocument = document as TransitionDocument

      document.documentElement.classList.add('route-changing')

      if (!reducedMotion && transitionDocument.startViewTransition) {
        document.documentElement.classList.add('native-route-transition')

        const transition = transitionDocument.startViewTransition(() => {
          flushSync(() => {
            navigateRef.current(targetPath)
          })
        })

        transition.finished.finally(() => {
          document.documentElement.classList.remove(
            'route-changing',
            'native-route-transition',
          )
        })
        return
      }

      // Smooth fallback for browsers without View Transition API.
      root.classList.add('is-leaving')
      navigateTimerRef.current = window.setTimeout(() => {
        navigateTimerRef.current = null
        navigateRef.current(targetPath)
      }, reducedMotion ? 0 : FALLBACK_EXIT_MS)
    }

    document.addEventListener('click', handleDocumentClick, true)

    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
      clearTimer(navigateTimerRef)
      clearTimer(enterTimerRef)
      document.documentElement.classList.remove(
        'route-changing',
        'native-route-transition',
      )
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
    const nativeTransition = html.classList.contains('native-route-transition')
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>('main > section, main > article, main > div'),
    )

    blocks.forEach((block, index) => {
      block.classList.add('reveal-block')
      block.classList.remove('is-visible')
      block.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 90}ms`)
    })

    // The first viewport must already be visible when the browser captures
    // the destination snapshot for a native cross-fade.
    if (nativeTransition) {
      blocks[0]?.classList.add('is-visible')
    }

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      blocks.forEach((block) => block.classList.add('is-visible'))
      if (!nativeTransition) html.classList.remove('route-changing')
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
        threshold: 0.06,
        rootMargin: '0px 0px -5% 0px',
      },
    )

    if (!nativeTransition) {
      requestAnimationFrame(() => {
        blocks[0]?.classList.add('is-visible')
      })
    }

    blocks.slice(1).forEach((block) => observer.observe(block))

    clearTimer(enterTimerRef)
    enterTimerRef.current = window.setTimeout(() => {
      enterTimerRef.current = null
      if (!nativeTransition) {
        document.documentElement.classList.remove('route-changing')
      }
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
