import type { ReactNode } from 'react'

export function PublicPageHero({
  eyebrow,
  title,
  accent,
  text,
  aside,
}: {
  eyebrow: string
  title: string
  accent?: string
  text?: string
  aside?: ReactNode
}) {
  return (
    <section className="relative -mt-[84px] overflow-hidden px-5 pb-14 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
      <div className="pointer-events-none absolute inset-0 bg-sand-50">
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
          style={{ filter: 'saturate(.72) contrast(.9) brightness(1.09)' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#faf8f3_0%,rgba(250,248,243,.95)_30%,rgba(250,248,243,.60)_60%,rgba(250,248,243,.14)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,248,243,.02)_0%,rgba(250,248,243,.08)_50%,rgba(250,248,243,.70)_80%,#faf8f3_100%)]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] py-7 md:py-11">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_.46fr] lg:items-end">
          <div className="max-w-[860px]">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
              {eyebrow}
            </div>
            <h1 className="mt-4 text-[clamp(3.15rem,7vw,6.5rem)] font-black leading-[.89] tracking-[-0.072em] text-brand-900">
              {title}
              {accent && <span className="block text-brand-500">{accent}</span>}
            </h1>
          </div>

          {(text || aside) && (
            <div className="lg:justify-self-end">
              {text && (
                <p className="max-w-md text-sm leading-7 text-ink-500 sm:text-base sm:leading-8">
                  {text}
                </p>
              )}
              {aside && <div className={text ? 'mt-5' : ''}>{aside}</div>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
