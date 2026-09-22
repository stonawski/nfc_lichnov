import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SectionHeading({
  eyebrow,
  title,
  text,
  to,
  linkLabel,
}: {
  eyebrow?: string
  title: string
  text?: string
  to?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
            {eyebrow}
          </div>
        )}
        <h2 className="max-w-3xl text-3xl font-black leading-[.98] tracking-[-0.05em] text-brand-900 sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {text && (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-500 sm:text-base">
            {text}
          </p>
        )}
      </div>

      {to && linkLabel && (
        <Link
          to={to}
          className="inline-flex items-center gap-2 self-start rounded-[15px] bg-white px-4 py-2.5 text-sm font-bold text-brand-900 ring-1 ring-sand-200 transition hover:-translate-y-0.5 hover:shadow-soft md:self-auto"
        >
          {linkLabel}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  )
}
