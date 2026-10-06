import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Images,
  Search,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DataFade } from '../components/DataFade'
import { HeroFieldBackdrop } from '../components/HeroFieldBackdrop'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { Seo } from '../components/Seo'
import {
  fetchGalleries,
  fetchGalleryBySlug,
  fetchGalleryImages,
  fetchTeams,
  galleryImageUrl,
} from '../lib/data'
import { formatDate } from '../lib/format'
import type { Gallery, GalleryImage } from '../lib/types'

const GALLERY_KINDS = [
  { value: 'all', label: 'Všechny' },
  { value: 'match', label: 'Zápasy' },
  { value: 'tournament', label: 'Turnaje' },
  { value: 'training', label: 'Tréninky' },
  { value: 'club', label: 'Klubové akce' },
  { value: 'other', label: 'Ostatní' },
] as const

type GalleryKind = (typeof GALLERY_KINDS)[number]['value']

export function GalleryPage() {
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState<GalleryKind>('all')
  const [teamId, setTeamId] = useState('all')
  const [year, setYear] = useState('all')

  const galleriesQuery = useQuery({
    queryKey: ['galleries'],
    queryFn: fetchGalleries,
    retry: false,
  })
  const imagesQuery = useQuery({
    queryKey: ['gallery-images'],
    queryFn: () => fetchGalleryImages(),
    retry: false,
  })
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  const imagesByGallery = useMemo(() => {
    const map = new Map<string, GalleryImage[]>()

    for (const image of imagesQuery.data ?? []) {
      const current = map.get(image.gallery_id) ?? []
      current.push(image)
      map.set(image.gallery_id, current)
    }

    return map
  }, [imagesQuery.data])

  const galleries = galleriesQuery.data ?? []
  const teams = teamsQuery.data ?? []
  const featured = galleries[0] ?? null
  const loading =
    galleriesQuery.isLoading || imagesQuery.isLoading || teamsQuery.isLoading

  const years = useMemo(
    () =>
      [...new Set(
        galleries
          .map((gallery) => galleryYear(gallery))
          .filter((value): value is string => Boolean(value)),
      )].sort((a, b) => Number(b) - Number(a)),
    [galleries],
  )

  const filtered = useMemo(() => {
    const needle = normalizeGallerySearch(search)

    return galleries.filter((gallery) => {
      if (kind !== 'all' && inferGalleryKind(gallery) !== kind) return false
      if (teamId !== 'all' && gallery.team_id !== teamId) return false
      if (year !== 'all' && galleryYear(gallery) !== year) return false

      if (needle) {
        const haystack = normalizeGallerySearch(
          [gallery.title, gallery.description].filter(Boolean).join(' '),
        )
        if (!haystack.includes(needle)) return false
      }

      return true
    })
  }, [galleries, kind, search, teamId, year])

  const hasFilters =
    search.trim().length > 0 || kind !== 'all' || teamId !== 'all' || year !== 'all'

  const visibleGalleries = hasFilters
    ? filtered
    : filtered.filter((gallery) => gallery.id !== featured?.id)

  const resetFilters = () => {
    setSearch('')
    setKind('all')
    setTeamId('all')
    setYear('all')
  }

  return (
    <main>
      <section className="relative -mt-[84px] overflow-hidden px-5 pb-10 pt-[120px] sm:-mt-[88px] sm:pt-[132px] md:px-8 md:pb-12 md:pt-[140px]">
        <HeroFieldBackdrop />

        <div className="relative mx-auto w-full max-w-[1240px]">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,.76fr)_minmax(440px,1.24fr)] lg:items-end">
            <div className="max-w-[650px] py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
                Fotogalerie NFC
              </div>
              <h1 className="mt-4 text-[clamp(3.3rem,6.6vw,6.35rem)] font-black leading-[.88] tracking-[-0.072em] text-brand-900">
                Život klubu
                <span className="block text-brand-500">v obrazech.</span>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-ink-500 sm:text-base sm:leading-8">
                Zápasy, turnaje, tréninky i chvíle mimo hřiště. Vyber si typ akce,
                tým nebo období a projdi si klub po fotografiích.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                <span className="rounded-full border border-white/80 bg-white/65 px-3 py-2 backdrop-blur">
                  {galleries.length} {galleryCountLabel(galleries.length)}
                </span>
                <span className="rounded-full border border-brand-500/15 bg-brand-50/80 px-3 py-2 text-brand-700 backdrop-blur">
                  {(imagesQuery.data ?? []).length} fotografií
                </span>
              </div>
            </div>

            <FeaturedGalleryCard
              gallery={featured}
              images={featured ? imagesByGallery.get(featured.id) ?? [] : []}
            />
          </div>

          <div className="mt-8 rounded-[28px] border border-brand-900/[0.08] bg-[#fbfaf6]/95 p-5 shadow-[0_14px_38px_rgba(24,53,42,.06)] backdrop-blur-sm sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(260px,.76fr)_1.24fr] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-brand-500">
                  Hledat
                </span>
                <span className="flex h-12 items-center gap-3 rounded-[16px] border border-brand-900/[0.08] bg-white px-4 transition-colors focus-within:border-brand-500/35">
                  <Search size={16} className="shrink-0 text-brand-900/45" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Zápas, turnaj, akce…"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-brand-900 outline-none placeholder:font-medium placeholder:text-ink-500/55"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-sand-100 hover:text-brand-900"
                      aria-label="Vymazat hledání"
                    >
                      <X size={13} />
                    </button>
                  )}
                </span>
              </label>

              <div className="min-w-0">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-brand-500">
                    Typ galerie
                  </span>
                  <span className="text-[10px] font-semibold text-ink-500">
                    {filtered.length} {galleryCountLabel(filtered.length)}
                  </span>
                </div>

                <div className="-my-1 flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {GALLERY_KINDS.map((item) => (
                    <GalleryFilterButton
                      key={item.value}
                      active={kind === item.value}
                      onClick={() => setKind(item.value)}
                    >
                      {item.label}
                    </GalleryFilterButton>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-brand-900/[0.08] pt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.18em] text-brand-500">
                    Tým
                  </span>
                  <div className="flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <GalleryFilterButton
                      active={teamId === 'all'}
                      onClick={() => setTeamId('all')}
                      compact
                    >
                      Všechny
                    </GalleryFilterButton>
                    {teams.map((team) => (
                      <GalleryFilterButton
                        key={team.id}
                        active={teamId === team.id}
                        onClick={() => setTeamId(team.id)}
                        compact
                      >
                        {team.short_name || team.name}
                      </GalleryFilterButton>
                    ))}
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3 sm:border-l sm:border-brand-900/[0.08] sm:pl-4">
                  <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.18em] text-brand-500">
                    Rok
                  </span>
                  <div className="flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <GalleryFilterButton
                      active={year === 'all'}
                      onClick={() => setYear('all')}
                      compact
                    >
                      Všechny
                    </GalleryFilterButton>
                    {years.map((item) => (
                      <GalleryFilterButton
                        key={item}
                        active={year === item}
                        onClick={() => setYear(item)}
                        compact
                      >
                        {item}
                      </GalleryFilterButton>
                    ))}
                  </div>
                </div>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex shrink-0 items-center gap-1.5 self-start text-[10px] font-bold text-brand-700 transition-colors hover:text-brand-500 lg:self-auto"
                >
                  <X size={12} />
                  Zrušit filtry
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-[1240px]">
          {loading ? (
            <LoadingState rows={5} />
          ) : galleriesQuery.isError || imagesQuery.isError || teamsQuery.isError ? (
            <EmptyState
              title="Galerii se nepodařilo načíst"
              text="Zkus načtení zopakovat. Pokud problém přetrvá, může být dočasně nedostupné spojení s obsahem klubu."
            />
          ) : galleries.length ? (
            visibleGalleries.length ? (
              <DataFade
                key={`${kind}-${teamId}-${year}-${search}`}
                className="stagger-children grid gap-5 md:grid-cols-2 lg:grid-cols-12"
              >
                {visibleGalleries.map((gallery, index) => {
                  const images = imagesByGallery.get(gallery.id) ?? []
                  const firstImage = images.find((image) => galleryImageUrl(image))
                  const cover = gallery.cover_image || (firstImage ? galleryImageUrl(firstImage) : null)
                  const span =
                    index === 0 && hasFilters
                      ? 'lg:col-span-7'
                      : index % 3 === 0
                        ? 'lg:col-span-5'
                        : 'lg:col-span-4'

                  return (
                    <GalleryCard
                      key={gallery.id}
                      gallery={gallery}
                      cover={cover}
                      imageCount={images.length}
                      featured={false}
                      className={span}
                    />
                  )
                })}
              </DataFade>
            ) : (
              <div className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-8 text-center sm:p-10">
                <div className="text-xl font-extrabold tracking-[-0.035em] text-brand-900">
                  Pro tuto kombinaci zatím žádná galerie není.
                </div>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink-500">
                  Zkus jiný typ akce, tým nebo rok.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-[14px] bg-brand-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  Zobrazit všechny galerie
                </button>
              </div>
            )
          ) : (
            <EmptyGalleryOverview />
          )}
        </div>
      </section>
    </main>
  )
}

function FeaturedGalleryCard({
  gallery,
  images,
}: {
  gallery: Gallery | null
  images: GalleryImage[]
}) {
  if (!gallery) {
    return (
      <div className="relative min-h-[300px] overflow-hidden rounded-[34px] bg-brand-900 p-6 text-white shadow-[0_22px_64px_rgba(24,53,42,.15)] sm:p-8">
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] opacity-38"
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(24,53,42,.98)_0%,rgba(24,53,42,.82)_62%,rgba(20,83,45,.58)_100%)]" />

        <div className="relative flex min-h-[252px] flex-col justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/60">
            <Images size={12} />
            Nejnovější galerie
          </div>

          <div>
            <h2 className="max-w-xl text-3xl font-black leading-[.98] tracking-[-0.05em] sm:text-4xl">
              Fotky od lajny i mimo ni.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/60">
              První publikovaná galerie se zobrazí právě tady. Připravené jsou
              zápasy, turnaje, tréninky i klubové akce.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const firstImage = images.find((image) => galleryImageUrl(image))
  const cover = gallery.cover_image || (firstImage ? galleryImageUrl(firstImage) : null)

  return (
    <Link
      to={`/galerie/${gallery.slug || gallery.id}`}
      className="group relative min-h-[300px] overflow-hidden rounded-[34px] bg-brand-900 text-white shadow-[0_22px_64px_rgba(24,53,42,.15)]"
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
        />
      ) : (
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,53,42,.08)_0%,rgba(24,53,42,.34)_45%,rgba(24,53,42,.97)_100%)]" />

      <div className="relative flex min-h-[300px] flex-col justify-between p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-brand-900/30 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/75 backdrop-blur">
            <Images size={12} />
            {images.length} {images.length === 1 ? 'fotografie' : 'fotografií'}
          </div>
          <ArrowUpRight
            size={20}
            className="text-white/55 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          />
        </div>

        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-white/50">
            <span>{galleryKindLabel(inferGalleryKind(gallery))}</span>
            <span>·</span>
            <span>{formatDate(gallery.event_date || gallery.created_at)}</span>
          </div>
          <h2 className="mt-3 text-3xl font-black leading-[.98] tracking-[-0.05em] sm:text-4xl">
            {gallery.title}
          </h2>
          {gallery.description && (
            <p className="mt-4 line-clamp-2 max-w-xl text-sm leading-6 text-white/65">
              {gallery.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function GalleryFilterButton({
  active,
  onClick,
  children,
  compact = false,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full font-bold transition-colors ${
        compact ? 'px-3 py-2 text-[10px]' : 'px-3.5 py-2.5 text-xs'
      } ${
        active
          ? 'bg-brand-900 text-white'
          : 'border border-brand-900/[0.08] bg-white text-ink-500 hover:text-brand-900'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyGalleryOverview() {
  return (
    <DataFade className="overflow-hidden rounded-[34px] border border-sand-200 bg-[#fbfaf6]">
      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="p-7 sm:p-9">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
            Připraveno pro první alba
          </div>
          <h2 className="mt-3 max-w-xl text-3xl font-black leading-[1] tracking-[-0.05em] text-brand-900 sm:text-4xl">
            Galerie bude fungovat jako archiv života klubu.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-ink-500">
            Každé album může patřit konkrétnímu týmu a datu. Veřejný přehled pak
            dovolí rychle najít zápas, turnaj, trénink nebo klubovou akci.
          </p>
        </div>

        <div className="grid grid-cols-2 border-t border-sand-200 lg:border-l lg:border-t-0">
          {['Zápasy', 'Turnaje', 'Tréninky', 'Klubové akce'].map((label, index) => (
            <div
              key={label}
              className={`flex min-h-[145px] items-end p-5 sm:p-6 ${
                index % 2 === 0 ? 'border-r border-sand-200' : ''
              } ${index < 2 ? 'border-b border-sand-200' : ''}`}
            >
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand-500">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="mt-2 text-lg font-extrabold tracking-[-0.035em] text-brand-900">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DataFade>
  )
}

function inferGalleryKind(gallery: Gallery): GalleryKind {
  const text = normalizeGallerySearch(
    [gallery.title, gallery.description].filter(Boolean).join(' '),
  )

  if (/turnaj|pohar|memorial|halov/.test(text)) return 'tournament'
  if (/trenink|soustreden|kemp/.test(text)) return 'training'
  if (/zapasy|zapas|utkani|mistrov| vs /.test(` ${text} `)) return 'match'
  if (/akce|oslav|ples|nabor|dokopn|den klubu|brigad/.test(text)) return 'club'
  return 'other'
}

function galleryKindLabel(kind: GalleryKind) {
  return GALLERY_KINDS.find((item) => item.value === kind)?.label ?? 'Ostatní'
}

function galleryYear(gallery: Gallery) {
  const value = gallery.event_date || gallery.created_at
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return String(date.getFullYear())
}

function normalizeGallerySearch(value: string) {
  return value
    .toLocaleLowerCase('cs-CZ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function galleryCountLabel(count: number) {
  if (count === 1) return 'galerie'
  if (count >= 2 && count <= 4) return 'galerie'
  return 'galerií'
}

export function GalleryDetailPage() {
  const { slug = '' } = useParams()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const galleryQuery = useQuery({
    queryKey: ['gallery', slug],
    queryFn: () => fetchGalleryBySlug(slug),
    retry: false,
  })
  const gallery = galleryQuery.data

  const imagesQuery = useQuery({
    queryKey: ['gallery-images', gallery?.id],
    queryFn: () => fetchGalleryImages(gallery!.id),
    enabled: Boolean(gallery?.id),
    retry: false,
  })

  const images = (imagesQuery.data ?? []).filter((image) => Boolean(galleryImageUrl(image)))
  const activeImage = activeIndex == null ? null : images[activeIndex]

  useEffect(() => {
    if (activeIndex == null) return

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeIndex])

  if (galleryQuery.isLoading) {
    return (
      <main className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1100px]">
          <LoadingState rows={5} />
        </div>
      </main>
    )
  }

  if (!gallery) {
    return (
      <main className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1100px]">
          <EmptyState
            title="Galerie nebyla nalezena"
            text="Je možné, že byla odstraněná nebo zatím není publikovaná."
          />
        </div>
      </main>
    )
  }

  return (
    <main className="data-fade-in">
      <Seo
        title={gallery.title || 'Fotogalerie'}
        description={gallery.description || 'Fotogalerie NFC Lichnov ze zápasů, turnajů a života klubu.'}
        image={gallery.cover_image}
        canonicalPath={`/galerie/${gallery.slug || gallery.id}`}
      />
      <section className="site-hero-frame relative -mt-[84px] flex flex-col overflow-hidden px-5 pb-16 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
        <HeroFieldBackdrop tone="dark" />

        <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center py-6 text-white md:py-10">
          <Link
            to="/galerie"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/65 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Zpět na galerie
          </Link>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_.48fr] lg:items-end">
            <div className="max-w-4xl">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 sm:text-xs">
                Fotogalerie
              </div>
              <h1 className="mt-4 text-[clamp(3rem,7vw,6.2rem)] font-black leading-[.91] tracking-[-0.068em]">
                {gallery.title || 'NFC Lichnov'}
              </h1>
              {(gallery.event_date || gallery.created_at) && (
                <div className="mt-5 text-sm font-semibold text-white/60">
                  {formatDate(gallery.event_date || gallery.created_at)}
                </div>
              )}
            </div>

            {gallery.description && (
              <p className="max-w-lg text-sm leading-7 text-white/70 sm:text-base lg:justify-self-end">
                {gallery.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          {imagesQuery.isLoading ? (
            <LoadingState rows={6} />
          ) : imagesQuery.isError ? (
            <EmptyState
              title="Fotografie se nepodařilo načíst"
              text="Zkontroluj veřejná oprávnění tabulky gallery_images."
            />
          ) : images.length ? (
            <DataFade className="stagger-children columns-1 gap-4 sm:columns-2 lg:columns-3">
              {images.map((image, index) => {
                const url = galleryImageUrl(image)
                if (!url) return null

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-[28px] bg-sand-100 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <img
                      src={url}
                      alt={image.caption || gallery.title || 'Fotografie NFC Lichnov'}
                      loading="lazy"
                      className="h-auto w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                    />

                    {image.caption && (
                      <div className="border-t border-sand-200 bg-white px-4 py-3 text-xs leading-5 text-ink-500">
                        {image.caption}
                      </div>
                    )}
                  </button>
                )
              })}
            </DataFade>
          ) : (
            <DataFade>
              <EmptyState
              title="V této galerii zatím nejsou fotografie"
              text="Fotky se zde objeví po prvním uploadu do galerie."
              />
            </DataFade>
          )}
        </div>
      </section>

      {activeImage && activeIndex != null && (
        <Lightbox
          image={activeImage}
          index={activeIndex}
          count={images.length}
          onClose={() => setActiveIndex(null)}
          onPrevious={() =>
            setActiveIndex((activeIndex - 1 + images.length) % images.length)
          }
          onNext={() => setActiveIndex((activeIndex + 1) % images.length)}
        />
      )}
    </main>
  )
}

function GalleryCard({
  gallery,
  cover,
  imageCount,
  featured,
  className,
}: {
  gallery: Gallery
  cover: string | null
  imageCount: number
  featured: boolean
  className: string
}) {
  return (
    <Link
      to={`/galerie/${gallery.slug || gallery.id}`}
      className={`group relative min-h-[300px] overflow-hidden rounded-[34px] bg-brand-900 text-white shadow-soft transition duration-500 hover:-translate-y-1 ${featured ? 'lg:min-h-[630px]' : 'lg:min-h-[305px]'} ${className}`}
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-65"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/28 to-transparent" />

      <div className="relative flex h-full min-h-[300px] flex-col justify-between p-6 sm:p-7 lg:min-h-[inherit]">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/75 backdrop-blur">
            <Images size={13} />
            {imageCount} {imageCount === 1 ? 'fotografie' : 'fotografií'}
          </div>

          <ArrowUpRight
            size={19}
            className="text-white/65 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
          />
        </div>

        <div>
          {(gallery.event_date || gallery.created_at) && (
            <div className="text-xs font-semibold text-white/55">
              {formatDate(gallery.event_date || gallery.created_at)}
            </div>
          )}

          <h2
            className={`mt-2 max-w-2xl font-extrabold leading-[0.98] tracking-[-0.05em] ${featured ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}
          >
            {gallery.title || 'Fotogalerie NFC Lichnov'}
          </h2>

          {featured && gallery.description && (
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
              {gallery.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function Lightbox({
  image,
  index,
  count,
  onClose,
  onPrevious,
  onNext,
}: {
  image: GalleryImage
  index: number
  count: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  const [closing, setClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const url = galleryImageUrl(image)

  const requestClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    closeTimerRef.current = window.setTimeout(onClose, 320)
  }, [closing, onClose])

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
      if (event.key === 'ArrowLeft') onPrevious()
      if (event.key === 'ArrowRight') onNext()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onNext, onPrevious, requestClose])

  useEffect(
    () => () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current)
      }
    },
    [],
  )

  if (!url) return null

  return (
    <div
      className={`${closing ? 'lightbox-exit' : 'lightbox-enter'} fixed inset-0 z-[80] grid place-items-center bg-brand-900/95 p-3 backdrop-blur-md sm:p-6`}
      role="dialog"
      aria-modal="true"
      aria-label="Náhled fotografie"
      onClick={requestClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={requestClose}
        aria-label="Zavřít fotografii"
        className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
      >
        <X size={20} />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onPrevious()
            }}
            aria-label="Předchozí fotografie"
            className="absolute left-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onNext()
            }}
            aria-label="Další fotografie"
            className="absolute right-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <div
        key={image.id}
        className="lightbox-media-enter flex max-h-[92vh] max-w-[92vw] flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={url}
          alt={image.caption || 'Fotografie NFC Lichnov'}
          className="max-h-[82vh] max-w-full rounded-[24px] object-contain shadow-2xl"
        />

        <div className="mt-4 flex items-center gap-4 text-xs text-white/55">
          <span>
            {index + 1} / {count}
          </span>
          {image.caption && <span>{image.caption}</span>}
        </div>
      </div>
    </div>
  )
}
