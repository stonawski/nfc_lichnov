import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export function SectionHeading({ eyebrow, title, text, to, linkLabel }: { eyebrow?: string; title: string; text?: string; to?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-500">{eyebrow}</div>}
        <h2 className="max-w-3xl text-3xl font-extrabold tracking-[-0.045em] text-brand-900 sm:text-4xl md:text-5xl">{title}</h2>
        {text && <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">{text}</p>}
      </div>
      {to && linkLabel && (
        <Link to={to} className="inline-flex items-center gap-2 self-start rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 ring-1 ring-sand-200 transition hover:-translate-y-0.5 hover:shadow-soft md:self-auto">
          {linkLabel}<ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  )
}
