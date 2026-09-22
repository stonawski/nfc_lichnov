import type { ReactNode } from 'react'

export function DataFade({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`data-fade-in ${className}`.trim()}>{children}</div>
}
