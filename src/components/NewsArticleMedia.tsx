import { ArrowUpRight, Images, Play } from 'lucide-react'
import { useState } from 'react'
import { Lightbox } from './GalleryLightbox'
import type { GalleryImage, NewsMedia } from '../lib/types'

function videoPresentation(url: string): { kind: 'embed' | 'file' | 'link'; src: string } {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return { kind: 'link', src: '' }

    const host = parsed.hostname.toLowerCase()
    let youtubeId: string | null = null
    if (host === 'youtube.com' || host === 'www.youtube.com') {
      youtubeId = parsed.searchParams.get('v') ??
        (/^\/(shorts|embed)\//.test(parsed.pathname) ? parsed.pathname.split('/')[2] : null)
    } else if (host === 'youtu.be') {
      youtubeId = parsed.pathname.split('/')[1] ?? null
    }
    if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      return { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${youtubeId}` }
    }

    if (host === 'vimeo.com' || host === 'www.vimeo.com') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0]
      if (videoId && /^\d+$/.test(videoId)) {
        return { kind: 'embed', src: `https://player.vimeo.com/video/${videoId}` }
      }
    }

    if (/\.(mp4|webm)$/i.test(parsed.pathname)) {
      return { kind: 'file', src: parsed.toString() }
    }
    return { kind: 'link', src: parsed.toString() }
  } catch {
    return { kind: 'link', src: '' }
  }
}

export function NewsArticleMedia({ items }: { items: NewsMedia[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const images: GalleryImage[] = items
    .filter((item) => item.media_type === 'image')
    .map((item) => ({
      id: item.id,
      gallery_id: item.news_id,
      image_url: item.media_url,
      caption: null,
      sort_order: item.sort_order,
      created_at: item.created_at,
      updated_at: item.created_at,
    }))
  if (!items.length) return null

  return (
    <section className="mt-14 border-t border-sand-200 pt-10" aria-label="Fotografie a videa k aktualitě">
      <div className="mb-6 flex items-center gap-3">
        <Images size={20} className="text-brand-500" />
        <h2 className="text-2xl font-black tracking-[-0.045em] text-brand-900 sm:text-3xl">
          Fotografie a videa
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item) => {
          if (item.media_type === 'image') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenIndex(images.findIndex((image) => image.id === item.id))}
                className="group block w-full overflow-hidden rounded-[20px] bg-sand-100 ring-1 ring-sand-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
                aria-label="Otevřít fotografii v galerii"
              >
                <img
                  src={item.media_url}
                  alt="Fotografie k aktualitě"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                />
              </button>
            )
          }

          const video = videoPresentation(item.media_url)
          return (
            <div key={item.id} className="overflow-hidden rounded-[20px] bg-brand-900 sm:col-span-2">
              {video.kind === 'embed' ? (
                <iframe
                  title="Video k aktualitě"
                  src={video.src}
                  loading="lazy"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              ) : video.kind === 'file' ? (
                <video src={video.src} controls playsInline preload="metadata" className="aspect-video w-full bg-black" />
              ) : (
                <a
                  href={video.src || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex aspect-video items-center justify-center gap-3 text-sm font-bold text-white hover:text-[#a3ddb3]"
                >
                  <Play size={22} /> Otevřít video <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          )
        })}
      </div>

      {openIndex !== null && images[openIndex] && (
        <Lightbox
          key={images[openIndex].id}
          image={images[openIndex]}
          index={openIndex}
          count={images.length}
          onClose={() => setOpenIndex(null)}
          onPrevious={() => setOpenIndex((openIndex - 1 + images.length) % images.length)}
          onNext={() => setOpenIndex((openIndex + 1) % images.length)}
        />
      )}
    </section>
  )
}
