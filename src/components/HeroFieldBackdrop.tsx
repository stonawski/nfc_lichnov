export type HeroBackdropTone = 'light' | 'dark'

export function PersistentHeroFieldBackdrop({
  tone = 'light',
  visible = true,
}: {
  tone?: HeroBackdropTone
  visible?: boolean
}) {
  const dark = tone === 'dark'

  return (
    <div
      aria-hidden="true"
      className={`persistent-hero-backdrop pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${dark ? 'bg-brand-900' : 'bg-sand-50'}`}
    >
      <div className="hero-field-image-frame absolute right-0 top-0">
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[66%_center]"
          style={{ filter: 'saturate(.82) contrast(.92) brightness(1.08)' }}
        />

        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            dark ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#18352a_0%,rgba(24,53,42,.82)_24%,rgba(24,53,42,.40)_55%,rgba(24,53,42,.12)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,53,42,.04)_0%,rgba(24,53,42,.12)_48%,rgba(24,53,42,.70)_78%,#18352a_100%)]" />
        </div>

        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            dark ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(250,248,243,.98) 0%, rgba(250,248,243,.72) 22%, rgba(250,248,243,.28) 48%, rgba(250,248,243,.08) 72%, rgba(250,248,243,.02) 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(250,248,243,.02) 0%, rgba(250,248,243,.06) 48%, rgba(250,248,243,.58) 78%, rgba(250,248,243,1) 100%)',
            }}
          />
        </div>
      </div>

      <div
        className={`hero-glow absolute inset-0 transition-opacity duration-300 ${
          dark ? 'opacity-0' : 'opacity-45'
        }`}
      />
    </div>
  )
}

// Hero image is owned by Layout so it stays mounted across public route changes.
// Existing page-level calls intentionally render nothing.
export function HeroFieldBackdrop(_: { tone?: HeroBackdropTone } = {}) {
  return null
}
