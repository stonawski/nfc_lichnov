import { initials } from '../lib/format'

export function ClubLogo({
  src,
  name,
  size = 'md',
  loading = 'lazy',
}: {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'hero'
  loading?: 'lazy' | 'eager'
}) {
  const classes =
    size === 'sm'
      ? 'h-9 w-9'
      : size === 'hero'
        ? 'h-24 w-24 sm:h-40 sm:w-40 lg:h-52 lg:w-52 xl:h-56 xl:w-56'
        : size === 'lg'
          ? 'h-16 w-16 sm:h-20 sm:w-20'
          : 'h-12 w-12'

  return src ? (
    <img
      src={src}
      alt={`Logo ${name}`}
      loading={loading}
      decoding="async"
      className={`${classes} ${size === 'hero' ? 'rounded-full bg-white p-2.5 sm:p-3 object-contain ring-1 ring-white/80 shadow-[0_14px_36px_rgba(0,0,0,.28)]' : 'rounded-full bg-white p-1 object-contain ring-1 ring-sand-200'}`}
    />
  ) : (
    <div
      role="img"
      aria-label={`Logo ${name}`}
      className={`${classes} grid place-items-center rounded-full bg-brand-700 font-bold text-white ring-1 ring-brand-500/20 ${size === 'hero' ? 'text-3xl sm:text-5xl lg:text-7xl' : ''}`}
    >
      {initials(name)}
    </div>
  )
}
