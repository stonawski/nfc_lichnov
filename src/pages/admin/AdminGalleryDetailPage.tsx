import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, ExternalLink, Images, Star, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { MediaUploader } from '../../admin/MediaUploader'
import {
  addGalleryImage,
  clearGalleryCover,
  deleteGalleryImage,
  fetchAdminGalleryById,
  fetchAdminGalleryImages,
  setGalleryCover,
  setGalleryPublished,
} from '../../lib/adminData'
import { formatDate } from '../../lib/format'
import { deleteMediaObjects, mediaObjectKeyFromUrl } from '../../lib/media'

export function AdminGalleryDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()

  const galleryQuery = useQuery({
    queryKey: ['admin-gallery', id],
    queryFn: () => fetchAdminGalleryById(id),
    enabled: Boolean(id),
    retry: false,
  })

  const imagesQuery = useQuery({
    queryKey: ['admin-gallery-images', id],
    queryFn: () => fetchAdminGalleryImages(id),
    enabled: Boolean(id),
    retry: false,
  })

  const coverMutation = useMutation({
    mutationFn: (coverImage: string) => setGalleryCover(id, coverImage),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-gallery', id] })
      void queryClient.invalidateQueries({ queryKey: ['admin-galleries'] })
      void queryClient.invalidateQueries({ queryKey: ['galleries'] })
    },
  })

  const gallery = galleryQuery.data
  const images = imagesQuery.data ?? []

  const publishMutation = useMutation({
    mutationFn: (published: boolean) => setGalleryPublished(id, published),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-gallery', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-galleries'] }),
        queryClient.invalidateQueries({ queryKey: ['galleries'] }),
      ])
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: async (image: { id: string; image_url: string }) => {
      const objectKey = mediaObjectKeyFromUrl(image.image_url)
      await deleteMediaObjects({
        scope: 'gallery',
        resourceId: id,
        objectKeys: [objectKey],
      })

      await deleteGalleryImage(image.id)

      if (gallery?.cover_image === image.image_url) {
        const replacement = images.find((item) => item.id !== image.id)?.image_url ?? null
        if (replacement) {
          await setGalleryCover(id, replacement)
        } else {
          await clearGalleryCover(id)
        }
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-gallery-images', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-gallery-image-counts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-gallery', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-galleries'] }),
        queryClient.invalidateQueries({ queryKey: ['gallery-images'] }),
        queryClient.invalidateQueries({ queryKey: ['galleries'] }),
      ])
    },
  })

  async function handleUploaded({ publicUrl }: { publicUrl: string }) {
    await addGalleryImage(id, publicUrl)

    if (!gallery?.cover_image && images.length === 0) {
      await setGalleryCover(id, publicUrl)
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-images', id] }),
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-image-counts'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-gallery', id] }),
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] }),
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] }),
      queryClient.invalidateQueries({ queryKey: ['galleries'] }),
    ])
  }

  if (galleryQuery.isLoading || imagesQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <div className="h-10 w-56 animate-pulse rounded-2xl bg-sand-100" />
        <div className="mt-6 h-48 animate-pulse rounded-[30px] bg-sand-100" />
        <div className="mt-5 h-80 animate-pulse rounded-[30px] bg-sand-100" />
      </div>
    )
  }

  if (!gallery || galleryQuery.isError || imagesQuery.isError) {
    return (
      <div className="mx-auto max-w-[900px] rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-8 text-center">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-brand-900">
          Galerie nebyla nalezena
        </h1>
        <Link
          to="/admin/galerie"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft size={16} />
          Zpět na galerie
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/admin/galerie"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-brand-900"
          >
            <ArrowLeft size={16} />
            Galerie
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className={
                gallery.published
                  ? 'rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-brand-700'
                  : 'rounded-full bg-sand-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-ink-500'
              }
            >
              {gallery.published ? 'Publikováno' : 'Koncept'}
            </span>
            <span className="text-xs text-ink-500">/{gallery.slug}</span>
          </div>

          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
            {gallery.title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-500">
            {(gallery.event_date || gallery.created_at) && (
              <span>{formatDate(gallery.event_date || gallery.created_at)}</span>
            )}
            <span>{images.length} {images.length === 1 ? 'fotografie' : 'fotografií'}</span>
          </div>
        </div>

        {gallery.published && (
          <Link
            to={`/galerie/${gallery.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100"
          >
            <ExternalLink size={16} />
            Veřejný náhled
          </Link>
        )}
      </div>

      <section className="mt-8 rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-7">
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
            Fotografie
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-brand-900">
            Nahrát do galerie
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Fotky se optimalizují v prohlížeči a uloží do společného Cloudflare R2 bucketu.
          </p>
        </div>

        <MediaUploader
          scope="gallery"
          resourceId={gallery.id}
          multiple
          onUploaded={handleUploaded}
        />

        {images.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 rounded-[24px] border border-brand-900/10 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-brand-500">
                {gallery.published ? 'Album je veřejné' : 'Fotky jsou připravené'}
              </div>
              <div className="mt-1 text-lg font-extrabold tracking-[-0.03em] text-brand-900">
                {gallery.published
                  ? 'Galerie je publikovaná na webu.'
                  : 'Můžeš album rovnou publikovat.'}
              </div>
              <p className="mt-1 text-sm leading-6 text-ink-500">
                {gallery.published
                  ? 'Pokud ho skryješ, zůstane uložené v administraci, ale návštěvníci ho neuvidí.'
                  : 'Po publikování se album zobrazí ve veřejné galerii.'}
              </p>
            </div>

            <button
              type="button"
              disabled={publishMutation.isPending}
              onClick={() => publishMutation.mutate(!gallery.published)}
              className={`inline-flex h-11 shrink-0 items-center justify-center rounded-2xl px-5 text-sm font-bold transition disabled:cursor-wait disabled:opacity-50 ${
                gallery.published
                  ? 'bg-white text-brand-900 ring-1 ring-sand-200 hover:bg-sand-100'
                  : 'bg-brand-900 text-white hover:bg-brand-700'
              }`}
            >
              {publishMutation.isPending
                ? 'Ukládám…'
                : gallery.published
                  ? 'Skrýt album'
                  : 'Publikovat album'}
            </button>
          </div>
        )}

        {publishMutation.isError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Stav publikace se nepodařilo změnit.
          </div>
        )}
      </section>

      {deleteImageMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Fotografii se nepodařilo smazat. Zkontroluj, že je nasazená Edge Function
          <code className="mx-1">media-delete</code>.
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6]">
        <div className="flex items-center justify-between gap-4 border-b border-sand-200 px-5 py-4 sm:px-6">
          <div>
            <div className="text-sm font-extrabold text-brand-900">Obsah galerie</div>
            <div className="mt-1 text-xs text-ink-500">
              Hvězdičkou vyber fotografii, která bude cover galerie.
            </div>
          </div>
          <Images size={19} className="text-brand-500" />
        </div>

        {images.length ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {images.map((image) => {
              const isCover = gallery.cover_image === image.image_url
              const changingCover =
                coverMutation.isPending && coverMutation.variables === image.image_url

              return (
                <article
                  key={image.id}
                  className="group overflow-hidden rounded-[24px] border border-sand-200 bg-white"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                    <img
                      src={image.image_url}
                      alt={image.caption || gallery.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />

                    <div className="absolute right-3 top-3 flex gap-2">
                      <button
                        type="button"
                        disabled={isCover || changingCover}
                        onClick={() => coverMutation.mutate(image.image_url)}
                        className={`grid h-10 w-10 place-items-center rounded-full backdrop-blur transition ${
                          isCover
                            ? 'bg-brand-500 text-white'
                            : 'bg-brand-900/65 text-white hover:bg-brand-500'
                        }`}
                        aria-label={isCover ? 'Titulní fotografie' : 'Nastavit jako titulní fotografii'}
                        title={isCover ? 'Titulní fotografie' : 'Nastavit jako cover'}
                      >
                        {isCover ? <Check size={16} /> : <Star size={16} />}
                      </button>

                      <button
                        type="button"
                        disabled={
                          deleteImageMutation.isPending &&
                          deleteImageMutation.variables?.id === image.id
                        }
                        onClick={() => {
                          if (
                            window.confirm(
                              'Opravdu chceš tuto fotografii smazat? Soubor bude odstraněn i z Cloudflare R2.',
                            )
                          ) {
                            deleteImageMutation.mutate({
                              id: image.id,
                              image_url: image.image_url,
                            })
                          }
                        }}
                        className="grid h-10 w-10 place-items-center rounded-full bg-red-600/90 text-white backdrop-blur transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-50"
                        aria-label="Smazat fotografii"
                        title="Smazat fotografii"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0 text-xs text-ink-500">
                      {image.caption || 'Bez popisku'}
                    </div>
                    {isCover && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-500">
                        Cover
                      </span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Images size={22} />
            </div>
            <h3 className="mt-5 text-xl font-extrabold text-brand-900">
              Galerie zatím nemá fotografie
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
              Nahraj první fotografie pomocí uploaderu výše.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
