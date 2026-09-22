import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Images,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { PublicPageHero } from '../components/PublicPageHero'
import {
  fetchGalleries,
  fetchGalleryBySlug,
  fetchGalleryImages,
  galleryImageUrl,
} from '../lib/data'
import { formatDate } from '../lib/format'
import type { Gallery, GalleryImage } from '../lib/types'

export function GalleryPage() {
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
  const loading = galleriesQuery.isLoading || imagesQuery.isLoading

  return (
    <main>
      <PublicPageHero
        eyebrow="Galerie"
        title="Život klubu"
        accent="v obrazech."
        text="Zápasy, turnaje, tréninky i chvíle mimo hřiště. Fotografie z jednotlivých akcí najdeš přehledně na jednom místě."
        aside={
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-700 shadow-sm backdrop-blur-xl">
            <Images size={13} />
            {galleries.length || '—'} galerií
          </div>
        }
      />

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          {loading ? (
            <LoadingState rows={5} />
          ) : galleriesQuery.isError || imagesQuery.isError ? (
            <EmptyState
              title="Galerii se nepodařilo načíst"
              text="Zkontroluj přístup k tabulkám galleries a gallery_images v Supabase."
            />
          ) : galleries.length ? (
            <div className="stagger-children grid gap-5 md:grid-cols-2 lg:grid-cols-12">
              {galleries.map((gallery, index) => {
                const images = imagesByGallery.get(gallery.id) ?? []
                const firstImage = images.find((image) => galleryImageUrl(image))
                const cover = gallery.cover_image || (firstImage ? galleryImageUrl(firstImage) : null)
                const span =
                  index === 0
                    ? 'lg:col-span-7 lg:row-span-2'
                    : index === 1
                      ? 'lg:col-span-5'
                      : index === 2
                        ? 'lg:col-span-5'
                        : 'lg:col-span-4'

                return (
                  <GalleryCard
                    key={gallery.id}
                    gallery={gallery}
                    cover={cover}
                    imageCount={images.length}
                    featured={index === 0}
                    className={span}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="Galerie je zatím prázdná"
              text="Jakmile nahrajeme první fotografie, objeví se automaticky tady."
            />
          )}
        </div>
      </section>
    </main>
  )
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) =>
          current == null ? null : (current - 1 + images.length) % images.length,
        )
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) =>
          current == null ? null : (current + 1) % images.length,
        )
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeIndex, images.length])

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
    <main>
      <section className="relative -mt-[84px] overflow-hidden px-5 pb-16 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
        <div className="pointer-events-none absolute inset-0 bg-brand-900">
          <img
            src={gallery.cover_image || '/hero-lichnov-field.webp'}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,53,42,.98)_0%,rgba(24,53,42,.88)_42%,rgba(24,53,42,.46)_74%,rgba(24,53,42,.24)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,53,42,.08)_0%,rgba(24,53,42,.18)_58%,#18352a_100%)]" />
        </div>

        <div className="relative mx-auto max-w-[1240px] py-6 text-white md:py-10">
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
              <p className="max-w-lg text-sm leading-7 text-white/68 sm:text-base lg:justify-self-end">
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
            <div className="stagger-children columns-1 gap-4 sm:columns-2 lg:columns-3">
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
            </div>
          ) : (
            <EmptyState
              title="V této galerii zatím nejsou fotografie"
              text="Fotky se zde objeví po prvním uploadu do galerie."
            />
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
  const url = galleryImageUrl(image)
  if (!url) return null

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-brand-900/95 p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Náhled fotografie"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
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
        className="flex max-h-[92vh] max-w-[92vw] flex-col items-center"
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
