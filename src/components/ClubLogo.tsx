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
        ? 'h-28 w-28 sm:h-44 sm:w-44 lg:h-60 lg:w-60 xl:h-72 xl:w-72'
        : size === 'lg'
          ? 'h-16 w-16 sm:h-20 sm:w-20'
          : 'h-12 w-12'

  return src ? (
    <img
      src={src}
      alt={`Logo ${name}`}
      loading={loading}
      decoding="async"
      className={`${classes} ${size === 'hero' ? 'object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,.48)]' : 'rounded-full bg-white p-1 object-contain ring-1 ring-sand-200'}`}
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
