import { useLayoutEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export function PageMotion({ children }: { children: ReactNode }) {
  const location = useLocation()

  useLayoutEffect(() => {
    const html = document.documentElement
    const previousScrollBehavior = html.style.scrollBehavior

    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    html.style.scrollBehavior = previousScrollBehavior

    window.requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true })
    })
  }, [location.pathname])

  return (
    <div className="page-motion-shell">
      <div key={location.pathname} className="route-content-enter">
        {children}
      </div>
    </div>
  )
}
