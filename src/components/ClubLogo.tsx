import { initials } from '../lib/format'

export function ClubLogo({ src, name, size = 'md' }: { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const classes = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-20 w-20' : 'h-12 w-12'
  return src ? (
    <img
      src={src}
      alt={`Logo ${name}`}
      loading="lazy"
      decoding="async"
      className={`${classes} rounded-full object-contain bg-white p-1 ring-1 ring-sand-200`}
    />
  ) : (
    <div aria-label={`Logo ${name}`} className={`${classes} grid place-items-center rounded-full bg-brand-700 text-white font-bold ring-1 ring-brand-500/20`}>
      {initials(name)}
    </div>
  )
}
