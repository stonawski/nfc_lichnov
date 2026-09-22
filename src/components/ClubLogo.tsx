import { initials } from '../lib/format'

export function ClubLogo({
  src,
  name,
  size = 'md',
  loading = 'lazy',
}: {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  loading?: 'lazy' | 'eager'
}) {
  const classes = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-20 w-20' : 'h-12 w-12'

  return src ? (
    <img
      src={src}
      alt={`Logo ${name}`}
      loading={loading}
      decoding="async"
      className={`${classes} rounded-full bg-white p-1 object-contain ring-1 ring-sand-200`}
    />
  ) : (
    <div
      role="img"
      aria-label={`Logo ${name}`}
      className={`${classes} grid place-items-center rounded-full bg-brand-700 font-bold text-white ring-1 ring-brand-500/20`}
    >
      {initials(name)}
    </div>
  )
}
