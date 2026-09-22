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


export function PublicDataPageLoading({
  sections = 3,
}: {
  sections?: number
}) {
  return (
    <main aria-busy="true" aria-label="Načítání stránky">
      <section className="site-hero-frame relative -mt-[84px] flex flex-col overflow-hidden px-5 pb-14 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
        <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 items-center py-8 md:py-12">
          <div className="w-full rounded-[38px] border border-white/65 bg-white/30 p-6 shadow-[0_20px_60px_rgba(24,53,42,.04)] backdrop-blur-sm sm:p-8 lg:p-10">
            <div className="h-3 w-28 rounded-full bg-white/70" />
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_.52fr] lg:items-end">
              <div>
                <div className="h-14 w-[78%] rounded-[20px] bg-white/70 sm:h-20" />
                <div className="mt-3 h-14 w-[56%] rounded-[20px] bg-white/55 sm:h-20" />
                <div className="mt-7 h-4 w-[68%] rounded-full bg-white/55" />
                <div className="mt-3 h-4 w-[48%] rounded-full bg-white/45" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="h-28 rounded-[26px] bg-white/58" />
                <div className="h-28 rounded-[26px] bg-white/48" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {Array.from({ length: sections }).map((_, index) => (
        <section
          key={index}
          className={`min-h-[430px] px-5 py-16 md:px-8 md:py-24 ${
            index % 2 === 0 ? 'bg-white' : 'bg-sand-100'
          }`}
        >
          <div className="mx-auto max-w-[1240px]">
            <div className="mb-8 h-3 w-24 rounded-full bg-sand-200" />
            <div className="mb-9 h-11 w-full max-w-[420px] rounded-[18px] bg-sand-200/80" />
            <LoadingState rows={index === 0 ? 4 : 3} />
          </div>
        </section>
      ))}
    </main>
  )
}
