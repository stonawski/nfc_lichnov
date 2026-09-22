import type { ReactNode } from 'react'
import { HeroFieldBackdrop } from './HeroFieldBackdrop'

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
    <section className="site-hero-frame relative -mt-[84px] flex flex-col overflow-hidden px-5 pb-14 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
      <HeroFieldBackdrop />

      <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 items-center py-7 md:py-11">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_.46fr] lg:items-end">
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
