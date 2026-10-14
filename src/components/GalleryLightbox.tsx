import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { galleryImageUrl } from '../lib/data'
import type { GalleryImage } from '../lib/types'

// Shared by gallery albums and article photos for the same viewing experience.
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
