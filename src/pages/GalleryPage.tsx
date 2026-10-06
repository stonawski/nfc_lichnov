import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Images,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, useSearchParams } from 'react-router-dom'
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

export function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [teamId, setTeamId] = useState('all')
  const [year, setYear] = useState('all')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [openGalleryId, setOpenGalleryId] = useState<string | null>(null)
  const [openImageIndex, setOpenImageIndex] = useState<number | null>(null)

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
  const featured = useMemo(
    () =>
      [...galleries].sort(
        (a, b) => galleryTimestamp(b) - galleryTimestamp(a),
      )[0] ?? null,
    [galleries],
  )
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

  const galleryTeams = useMemo(() => {
    const usedIds = new Set(
      galleries.map((gallery) => gallery.team_id).filter((value): value is string => Boolean(value)),
    )
    return teams.filter((team) => usedIds.has(team.id))
  }, [galleries, teams])

  const visibleGalleries = useMemo(() => {
    const next = galleries.filter((gallery) => {
      if (teamId !== 'all' && gallery.team_id !== teamId) return false
      if (year !== 'all' && galleryYear(gallery) !== year) return false
      return true
    })

    return [...next].sort((a, b) => {
      const difference = galleryTimestamp(b) - galleryTimestamp(a)
      return sort === 'newest' ? difference : -difference
    })
  }, [galleries, sort, teamId, year])

  const totalPhotos = imagesQuery.data?.length ?? 0
  const latestYear = years[0] ?? null
  const hasFilters = teamId !== 'all' || year !== 'all'
  const openGallery =
    galleries.find((gallery) => gallery.id === openGalleryId) ?? null
  const openGalleryImages = (
    openGallery ? imagesByGallery.get(openGallery.id) ?? [] : []
  ).filter((image) => Boolean(galleryImageUrl(image)))
  const openImage =
    openImageIndex == null ? null : openGalleryImages[openImageIndex] ?? null

  useEffect(() => {
    const requestedAlbum = searchParams.get('album')
    if (!requestedAlbum || openGalleryId || !galleries.length) return

    const target = galleries.find(
      (gallery) => gallery.slug === requestedAlbum || gallery.id === requestedAlbum,
    )
    if (target) setOpenGalleryId(target.id)
  }, [galleries, openGalleryId, searchParams])

  useEffect(() => {
    if (!openGallery) return

    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [openGallery])

  const closeAlbum = () => {
    setOpenImageIndex(null)
    setOpenGalleryId(null)

    if (searchParams.has('album')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('album')
      setSearchParams(nextParams, { replace: true })
    }
  }

  const resetFilters = () => {
    setTeamId('all')
    setYear('all')
  }

  return (
    <main>
      <section className="relative -mt-[84px] overflow-hidden px-5 pb-12 pt-[120px] sm:-mt-[88px] sm:pt-[132px] md:px-8 md:pb-16 md:pt-[140px]">
        <HeroFieldBackdrop />

        <div className="relative mx-auto w-full max-w-[1240px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,.72fr)_minmax(500px,1.28fr)] lg:items-center">
            <div className="max-w-[620px] py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
                Fotogalerie NFC
              </div>
              <h1 className="mt-4 text-[clamp(3.3rem,6.6vw,6.35rem)] font-black leading-[.88] tracking-[-0.072em] text-brand-900">
                Klub očima
                <span className="block text-brand-500">fotografií.</span>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-ink-500 sm:text-base sm:leading-8">
                Zápasy, turnaje, tréninky i chvíle kolem hřiště. Každé album drží
                jednu část klubového života pohromadě.
              </p>

              <div className="mt-9 flex items-center gap-7 border-t border-brand-900/10 pt-5 sm:gap-10">
                <GalleryMetric value={galleries.length} label="alb" />
                <GalleryMetric value={totalPhotos} label="fotografií" />
                <GalleryMetric value={latestYear ?? '—'} label="poslední rok" />
              </div>
            </div>

            <GalleryHeroVisual
              gallery={featured}
              images={featured ? imagesByGallery.get(featured.id) ?? [] : []}
              onOpen={() => featured && setOpenGalleryId(featured.id)}
            />
          </div>
        </div>
      </section>

      <section id="gallery-albums" className="scroll-mt-24 bg-sand-100 px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-col gap-6 border-b border-brand-900/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
                Fotogalerie
              </div>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
                Alba
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-500">
                Procházej celé akce jako alba, ne jednotlivé fotografie bez kontextu.
              </p>
            </div>

            {(galleryTeams.length > 0 || years.length > 0) && (
              <div className="flex flex-wrap items-end gap-3">
                {galleryTeams.length > 0 && (
                  <GallerySelect
                    label="Tým"
                    value={teamId}
                    onChange={setTeamId}
                    options={[
                      { value: 'all', label: 'Všechny týmy' },
                      ...galleryTeams.map((team) => ({
                        value: team.id,
                        label: team.short_name || team.name,
                      })),
                    ]}
                  />
                )}

                {years.length > 0 && (
                  <GallerySelect
                    label="Rok"
                    value={year}
                    onChange={setYear}
                    options={[
                      { value: 'all', label: 'Všechny roky' },
                      ...years.map((item) => ({ value: item, label: item })),
                    ]}
                  />
                )}

                <GallerySelect
                  label="Řazení"
                  value={sort}
                  onChange={(value) => setSort(value as 'newest' | 'oldest')}
                  options={[
                    { value: 'newest', label: 'Nejnovější' },
                    { value: 'oldest', label: 'Nejstarší' },
                  ]}
                />
              </div>
            )}
          </div>

          <div className="mt-8">
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
                  key={`${teamId}-${year}-${sort}`}
                  className="stagger-children grid gap-5 md:grid-cols-2 lg:grid-cols-12"
                >
                  {visibleGalleries.map((gallery, index) => {
                    const images = imagesByGallery.get(gallery.id) ?? []
                    const featuredAlbum = index === 0 && !hasFilters
                    const span = featuredAlbum
                      ? 'lg:col-span-7 lg:row-span-2'
                      : index === 1 || index === 2
                        ? 'lg:col-span-5'
                        : index % 3 === 0
                          ? 'lg:col-span-5'
                          : 'lg:col-span-4'

                    return (
                      <GalleryCard
                        key={gallery.id}
                        gallery={gallery}
                        images={images}
                        featured={featuredAlbum}
                        className={span}
                        onOpen={() => setOpenGalleryId(gallery.id)}
                      />
                    )
                  })}
                </DataFade>
              ) : (
                <div className="rounded-[30px] border border-brand-900/10 bg-[#fbfaf6] p-8 text-center sm:p-10">
                  <div className="text-xl font-extrabold tracking-[-0.035em] text-brand-900">
                    V tomto výběru zatím žádné album není.
                  </div>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink-500">
                    Zkus jiný tým nebo období.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 text-sm font-bold text-brand-700 transition-colors hover:text-brand-500"
                  >
                    Zobrazit všechna alba
                  </button>
                </div>
              )
            ) : (
              <EmptyGalleryShelf />
            )}
          </div>
        </div>
      </section>

      {!loading && years.length > 1 && (
        <section className="bg-white px-5 py-14 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid gap-8 lg:grid-cols-[.55fr_1.45fr] lg:items-start">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
                  Archiv
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-brand-900 sm:text-4xl">
                  Rok po roce.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-ink-500">
                  Rychlý vstup do starších sezon a klubových vzpomínek.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {years.map((item) => {
                  const yearGalleries = galleries.filter(
                    (gallery) => galleryYear(gallery) === item,
                  )
                  const photoCount = yearGalleries.reduce(
                    (sum, gallery) => sum + (imagesByGallery.get(gallery.id)?.length ?? 0),
                    0,
                  )

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setYear(item)
                        window.requestAnimationFrame(() => {
                          document
                            .getElementById('gallery-albums')
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        })
                      }}
                      className="group flex min-h-[126px] items-end justify-between rounded-[24px] border border-sand-200 bg-[#fbfaf6] p-5 text-left transition-colors hover:border-brand-500/25 hover:bg-brand-50/40"
                    >
                      <div>
                        <div className="text-3xl font-black tracking-[-0.05em] text-brand-900">
                          {item}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-ink-500">
                          {yearGalleries.length} {galleryCountLabel(yearGalleries.length)} · {photoCount} fotek
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-ink-500 transition-transform group-hover:translate-x-1 group-hover:text-brand-500"
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}
      {openGallery && (
        <AlbumOverlay
          gallery={openGallery}
          images={openGalleryImages}
          onClose={closeAlbum}
          onOpenImage={setOpenImageIndex}
          lightboxOpen={openImageIndex != null}
        />
      )}

      {openGallery && openImage && openImageIndex != null && (
        <Lightbox
          image={openImage}
          index={openImageIndex}
          count={openGalleryImages.length}
          onClose={() => setOpenImageIndex(null)}
          onPrevious={() =>
            setOpenImageIndex(
              (openImageIndex - 1 + openGalleryImages.length) %
                openGalleryImages.length,
            )
          }
          onNext={() =>
            setOpenImageIndex((openImageIndex + 1) % openGalleryImages.length)
          }
        />
      )}

    </main>
  )
}

function GalleryHeroVisual({
  gallery,
  images,
  onOpen,
}: {
  gallery: Gallery | null
  images: GalleryImage[]
  onOpen: () => void
}) {
  const urls = images
    .map((image) => galleryImageUrl(image))
    .filter((value): value is string => Boolean(value))
    .slice(0, 3)
  const fallback = gallery?.cover_image || urls[0] || '/hero-lichnov-field.webp'

  if (!gallery) {
    return (
      <div className="relative min-h-[390px] overflow-hidden rounded-[36px] bg-brand-900 shadow-[0_24px_70px_rgba(24,53,42,.14)]">
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[66%_center] opacity-45"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,53,42,.12)_0%,rgba(24,53,42,.88)_100%)]" />

        <div className="relative flex min-h-[390px] flex-col justify-between p-7 sm:p-9">
          <div className="flex justify-end">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 w-20 rotate-[-4deg] rounded-[14px] border border-white/15 bg-white/[0.08]" />
              <div className="mt-5 h-16 w-20 rotate-[3deg] rounded-[14px] border border-white/15 bg-white/[0.05]" />
            </div>
          </div>

          <div className="max-w-xl text-white">
            <div className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
              <Images size={13} />
              První album čeká
            </div>
            <h2 className="mt-3 text-3xl font-black leading-[1] tracking-[-0.05em] sm:text-4xl">
              Jedna akce. Jeden příběh. Všechny fotky pohromadě.
            </h2>
          </div>
        </div>
      </div>
    )
  }

  const previewUrls = albumPreviewUrls(gallery, images)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block min-h-[390px] w-full overflow-hidden rounded-[36px] text-left shadow-[0_24px_70px_rgba(24,53,42,.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <AlbumAccordionPreview
        urls={previewUrls}
        className="h-[390px]"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900 via-brand-900/72 to-transparent px-6 pb-6 pt-20 text-white sm:px-7">
        <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/50">
          Nejnovější album
        </div>
        <div className="mt-2 flex items-end justify-between gap-5">
          <div>
            <h2 className="text-2xl font-black leading-[1] tracking-[-0.045em] sm:text-3xl">
              {gallery.title}
            </h2>
            <div className="mt-3 flex items-center gap-3 text-[10px] font-semibold text-white/55">
              <span>{formatDate(gallery.event_date || gallery.created_at)}</span>
              <span>·</span>
              <span>
                {images.length} {photoCountLabel(images.length)}
              </span>
            </div>
          </div>

          <span className="grid h-11 w-11 shrink-0 place-items-center border border-white/20 bg-white/10 text-white backdrop-blur">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </button>
  )
}

function GalleryMetric({
  value,
  label,
}: {
  value: number | string
  label: string
}) {
  return (
    <div>
      <div className="text-2xl font-black tracking-[-0.045em] text-brand-900">
        {value}
      </div>
      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </div>
    </div>
  )
}

function GallerySelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const selected = options.find((option) => option.value === value) ?? options[0]

  return (
    <div className="relative">
      <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-ink-500">
        {label}
      </div>

      <details ref={detailsRef} className="group relative">
        <summary className="flex h-10 min-w-[142px] cursor-pointer list-none items-center justify-between gap-3 rounded-[14px] border border-brand-900/10 bg-[#fbfaf6] px-3.5 text-xs font-bold text-brand-900 outline-none transition-colors hover:border-brand-500/25 hover:bg-white focus-visible:ring-2 focus-visible:ring-brand-500/30 [&::-webkit-details-marker]:hidden">
          <span>{selected?.label}</span>
          <ChevronDown
            size={14}
            className="shrink-0 text-brand-500 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>

        <div className="absolute right-0 z-30 mt-2 max-h-64 min-w-[200px] overflow-y-auto rounded-[18px] border border-brand-900/10 bg-[#fbfaf6] p-1.5 shadow-[0_18px_45px_rgba(24,53,42,.14)]">
          {options.map((option) => {
            const active = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  detailsRef.current?.removeAttribute('open')
                }}
                className={`flex w-full items-center justify-between gap-4 rounded-[13px] px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                  active
                    ? 'bg-brand-900 text-white'
                    : 'text-ink-500 hover:bg-brand-50 hover:text-brand-900'
                }`}
              >
                <span>{option.label}</span>
                <Check
                  size={13}
                  className={active ? 'text-brand-500' : 'opacity-0'}
                />
              </button>
            )
          })}
        </div>
      </details>
    </div>
  )
}

function EmptyGalleryShelf() {
  return (
    <DataFade>
      <div className="grid overflow-hidden rounded-[34px] border border-brand-900/10 bg-[#fbfaf6] lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative min-h-[330px] overflow-hidden">
          <img
            src="/hero-lichnov-field.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[64%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,53,42,.90)_0%,rgba(24,53,42,.42)_100%)]" />
          <div className="relative flex min-h-[330px] items-end p-7 text-white sm:p-9">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/45">
                První album
              </div>
              <div className="mt-2 max-w-lg text-3xl font-black leading-[1] tracking-[-0.05em]">
                Fotky se tu objeví jako celé příběhy z jedné akce.
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-9">
          <div className="text-[10px] font-bold uppercase tracking-[0.17em] text-brand-500">
            Co galerie umí
          </div>
          <div className="mt-5 divide-y divide-sand-200">
            {[
              ['Album podle akce', 'Fotografie z jednoho zápasu, turnaje nebo klubového dne drží pohromadě.'],
              ['Tým a datum', 'Album lze přiřadit týmu a později ho rychle najít podle období.'],
              ['Titulní fotografie', 'Každé album má vlastní cover a veřejný detail s lightboxem.'],
            ].map(([title, text]) => (
              <div key={title} className="py-4 first:pt-0 last:pb-0">
                <div className="text-sm font-extrabold text-brand-900">{title}</div>
                <div className="mt-1 text-xs leading-5 text-ink-500">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DataFade>
  )
}

function galleryTimestamp(gallery: Gallery) {
  const value = gallery.event_date || gallery.created_at
  const timestamp = value ? new Date(value).getTime() : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function galleryYear(gallery: Gallery) {
  const timestamp = galleryTimestamp(gallery)
  if (!timestamp) return null
  return String(new Date(timestamp).getFullYear())
}

function galleryCountLabel(count: number) {
  if (count === 1) return 'album'
  if (count >= 2 && count <= 4) return 'alba'
  return 'alb'
}

function photoCountLabel(count: number) {
  if (count === 1) return 'fotografie'
  if (count >= 2 && count <= 4) return 'fotografie'
  return 'fotografií'
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
  images,
  featured,
  className,
  onOpen,
}: {
  gallery: Gallery
  images: GalleryImage[]
  featured: boolean
  className: string
  onOpen: () => void
}) {
  const previewUrls = albumPreviewUrls(gallery, images)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative block w-full overflow-hidden rounded-[30px] bg-brand-900 text-left shadow-[0_12px_34px_rgba(24,53,42,.05)] transition-shadow hover:shadow-[0_20px_46px_rgba(24,53,42,.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        featured ? 'lg:row-span-2' : ''
      } ${className}`}
    >
      <AlbumAccordionPreview
        urls={previewUrls}
        className={featured ? 'h-[440px] sm:h-[520px] lg:h-[590px]' : 'h-[300px] sm:h-[330px]'}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900 via-brand-900/82 to-transparent px-5 pb-5 pt-20 text-white sm:px-6 sm:pb-6">
        <div className="flex items-end justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-white/55">
              {(gallery.event_date || gallery.created_at) && (
                <span>{formatDate(gallery.event_date || gallery.created_at)}</span>
              )}
              <span className="text-brand-500">·</span>
              <span>
                {images.length} {photoCountLabel(images.length)}
              </span>
            </div>

            <h3
              className={`mt-2 max-w-2xl font-black leading-[1] tracking-[-0.05em] ${
                featured ? 'text-3xl sm:text-4xl' : 'text-2xl'
              }`}
            >
              {gallery.title || 'Fotogalerie NFC Lichnov'}
            </h3>

            {featured && gallery.description && (
              <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-white/65">
                {gallery.description}
              </p>
            )}
          </div>

          <span className="grid h-10 w-10 shrink-0 place-items-center border border-white/20 bg-white/10 text-white backdrop-blur transition-colors group-hover:bg-white/16">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </button>
  )
}

function AlbumAccordionPreview({
  urls,
  className,
}: {
  urls: string[]
  className: string
}) {
  return (
    <div className={`flex overflow-hidden ${className}`}>
      {urls.map((url, index) => (
        <div
          key={`${url}-${index}`}
          className="group/photo relative min-w-0 flex-1 overflow-hidden transition-all duration-300 ease-out sm:hover:flex-[3.25]"
        >
          <img
            src={url}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/photo:scale-[1.015]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/18 via-transparent to-transparent" />
          {urls.length > 1 && (
            <span className="absolute left-3 top-3 bg-brand-900/45 px-2 py-1 text-[9px] font-black tabular-nums text-white/80 opacity-0 backdrop-blur transition-opacity duration-200 group-hover/photo:opacity-100">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function albumPreviewUrls(gallery: Gallery, images: GalleryImage[]) {
  const urls: string[] = []
  const seen = new Set<string>()

  const add = (value: string | null | undefined) => {
    if (!value || seen.has(value)) return
    seen.add(value)
    urls.push(value)
  }

  add(gallery.cover_image)
  images.forEach((image) => add(galleryImageUrl(image)))

  if (!urls.length) add('/hero-lichnov-field.webp')
  return urls.slice(0, 4)
}

export function AlbumOverlay({
  gallery,
  images,
  onClose,
  onOpenImage,
  lightboxOpen,
}: {
  gallery: Gallery
  images: GalleryImage[]
  onClose: () => void
  onOpenImage: (index: number) => void
  lightboxOpen: boolean
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [contentReady, setContentReady] = useState(false)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    setContentReady(false)

    const timer = window.setTimeout(() => {
      setContentReady(true)
    }, 220)

    return () => window.clearTimeout(timer)
  }, [gallery.id])

  useEffect(() => {
    if (lightboxOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [lightboxOpen, onClose])

  return createPortal(
    <div
      className="album-overlay-backdrop fixed inset-0 z-[120] flex items-center justify-center bg-brand-900/70 p-3 sm:p-5 lg:p-7"
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-overlay-title"
      onClick={onClose}
    >
      <div
        className="album-overlay-panel relative flex max-h-[94vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-[34px] border border-white/60 bg-[#fbfaf6] shadow-[0_38px_100px_rgba(24,53,42,.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="relative z-10 flex shrink-0 items-start justify-between gap-6 border-b border-brand-900/[0.08] bg-[#fbfaf6]/95 px-5 py-5 backdrop-blur-xl sm:px-7 sm:py-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-brand-500">
              <span>Fotogalerie</span>
              {(gallery.event_date || gallery.created_at) && (
                <>
                  <span className="text-brand-900/20">·</span>
                  <span className="text-ink-500">
                    {formatDate(gallery.event_date || gallery.created_at)}
                  </span>
                </>
              )}
              <span className="text-brand-900/20">·</span>
              <span className="text-ink-500">
                {images.length} {photoCountLabel(images.length)}
              </span>
            </div>

            <h2
              id="album-overlay-title"
              className="mt-2 max-w-4xl text-2xl font-black leading-[1] tracking-[-0.045em] text-brand-900 sm:text-3xl"
            >
              {gallery.title || 'Fotogalerie NFC Lichnov'}
            </h2>

            {gallery.description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-500">
                {gallery.description}
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-900/10 bg-white text-brand-900 transition-colors hover:border-brand-500/25 hover:bg-brand-50"
            aria-label="Zavřít album"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 lg:p-6">
          {!contentReady ? (
            <div className="grid min-h-[360px] place-items-center">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-500/60">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                Načítám album
              </div>
            </div>
          ) : images.length ? (
            <div className="album-grid-enter columns-1 gap-3 sm:columns-2 lg:columns-3">
              {images.map((image, index) => {
                const url = galleryImageUrl(image)
                if (!url) return null

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => onOpenImage(index)}
                    className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-[20px] bg-sand-100 text-left [content-visibility:auto] [contain-intrinsic-size:320px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <img
                      src={url}
                      alt={image.caption || gallery.title || 'Fotografie NFC Lichnov'}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.01]"
                    />
                    {image.caption && (
                      <div className="border-t border-sand-200 bg-white px-4 py-3 text-xs leading-5 text-ink-500">
                        {image.caption}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="album-grid-enter grid min-h-[360px] place-items-center text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Images size={22} />
                </div>
                <h3 className="mt-5 text-xl font-extrabold text-brand-900">
                  Album zatím nemá fotografie
                </h3>
                <p className="mt-2 text-sm text-ink-500">
                  Fotky se objeví po prvním uploadu do galerie.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function Lightbox({
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

  return createPortal(
    <div
      className={`${closing ? 'lightbox-exit' : 'lightbox-enter'} fixed inset-0 z-[130] grid place-items-center bg-brand-900/95 p-3 backdrop-blur-md sm:p-6`}
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
    </div>,
    document.body,
  )
}
