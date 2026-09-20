import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export function PageMotion({ children }: { children: ReactNode }) {
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>('main > section, main > article, main > div'),
    )

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      blocks.forEach((block) => block.classList.add('reveal-block', 'is-visible'))
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
        rootMargin: '0px 0px -7% 0px',
      },
    )

    blocks.forEach((block, index) => {
      block.classList.add('reveal-block')
      block.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 45}ms`)
      observer.observe(block)
    })

    return () => observer.disconnect()
  }, [location.pathname])

  return (
    <div key={location.pathname} ref={rootRef} className="page-enter">
      {children}
    </div>
  )
}
