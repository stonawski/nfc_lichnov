import type { CSSProperties } from 'react'

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="content-enter space-y-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Načítání obsahu"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="loading-row-enter h-20 rounded-[24px] border border-sand-200/70 bg-white/70"
          style={{ '--loading-delay': `${index * 70}ms` } as CSSProperties}
        />
      ))}
    </div>
  )
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="content-enter rounded-[30px] border border-sand-200 bg-[#fbfaf6] px-6 py-11 text-center shadow-[0_10px_30px_rgba(24,53,42,.035)] sm:px-8 sm:py-12">
      <div className="mx-auto h-1 w-10 rounded-full bg-brand-500" />
      <h3 className="mt-5 text-xl font-extrabold tracking-[-0.035em] text-brand-900">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-500">{text}</p>
    </div>
  )
}

export function ErrorState({
  title = 'Obsah se nepodařilo načíst',
  text = 'Zkontroluj připojení a zkus načtení zopakovat.',
  onRetry,
}: {
  title?: string
  text?: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="content-enter rounded-[30px] border border-red-200 bg-red-50/70 px-6 py-11 text-center sm:px-8 sm:py-12"
    >
      <div className="mx-auto h-1 w-10 rounded-full bg-red-500" />
      <h3 className="mt-5 text-xl font-extrabold tracking-[-0.035em] text-brand-900">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-500">{text}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Zkusit znovu
        </button>
      )}
    </div>
  )
}
