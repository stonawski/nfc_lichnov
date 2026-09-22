import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { tacticalPositionLabel } from '../lib/playerPosition'
import type { Player, Team } from '../lib/types'
import { ClubLogo } from './ClubLogo'

type PlayerStripCarouselProps = {
  team: Team
  players: Player[]
  flush?: boolean
}

export function PlayerStripCarousel({
  team,
  players,
  flush = false,
}: PlayerStripCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)
  const recenteringRef = useRef(false)

  const loopPlayers = players.length > 1 ? [...players, ...players, ...players] : players

  useEffect(() => {
    const track = trackRef.current
    if (!track || players.length <= 1) return

    const frame = requestAnimationFrame(() => {
      const loopWidth = track.scrollWidth / 3
      track.scrollLeft = loopWidth
    })

    return () => cancelAnimationFrame(frame)
  }, [players])

  const keepInfinite = () => {
    const track = trackRef.current
    if (!track || players.length <= 1 || recenteringRef.current) return

    const loopWidth = track.scrollWidth / 3
    if (!loopWidth) return

    if (track.scrollLeft < loopWidth * 0.5) {
      recenteringRef.current = true
      track.scrollLeft += loopWidth
      requestAnimationFrame(() => {
        recenteringRef.current = false
      })
    } else if (track.scrollLeft > loopWidth * 1.5) {
      recenteringRef.current = true
      track.scrollLeft -= loopWidth
      requestAnimationFrame(() => {
        recenteringRef.current = false
      })
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const track = trackRef.current
    if (!track) return

    draggingRef.current = true
    dragStartX.current = event.clientX
    dragStartScroll.current = track.scrollLeft
    track.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || event.pointerType !== 'mouse') return
    const track = trackRef.current
    if (!track) return

    event.preventDefault()
    const delta = event.clientX - dragStartX.current
    track.scrollLeft = dragStartScroll.current - delta
  }

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    draggingRef.current = false

    const track = trackRef.current
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <section
      className={`content-enter player-strip relative z-20 w-full bg-brand-900 text-white ${
        flush ? 'mb-0 mt-0' : 'mb-14 mt-3'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 z-30 bg-[#00923F] ${
          flush ? 'top-0 h-[4px]' : 'top-[-15px] h-[5px]'
        }`}
      />

      <div
        ref={trackRef}
        onScroll={keepInfinite}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
          event.preventDefault()
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          event.currentTarget.scrollBy({
            left: event.key === 'ArrowRight' ? 300 : -300,
            behavior: reducedMotion ? 'auto' : 'smooth',
          })
        }}
        role="region"
        aria-label={`Hráči týmu ${team.name}`}
        tabIndex={0}
        className="relative z-10 flex cursor-grab overflow-x-auto overscroll-x-contain select-none [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {loopPlayers.map((player, index) => {
          const fullName = [player.first_name, player.last_name].filter(Boolean).join(' ') || 'Hráč NFC'
          const photo = player.photo_url

          return (
            <article
              key={`${player.id}-${index}`}
              className="player-strip-card group relative h-[350px] w-[72vw] max-w-[310px] shrink-0 overflow-hidden border-r border-white/10 sm:h-[390px] sm:w-[42vw] md:w-[31vw] lg:h-[420px] lg:w-[14.285vw] lg:max-w-none"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-white/[0.025] to-black/20" />

              {photo ? (
                <img
                  src={photo}
                  alt={fullName}
                  loading="lazy"
                  draggable={false}
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[92%] w-full object-cover object-top transition duration-500 group-hover:scale-[1.025]"
                />
              ) : (
                <img
                  src="/player-placeholder.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
                />
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              {player.number != null && (
                <div className="pointer-events-none absolute right-4 top-[58%] text-3xl font-black tracking-[-0.05em] text-[#e8d9a9] sm:right-5">
                  {player.number}
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <div className="max-w-[180px] text-xl font-extrabold leading-[0.98] tracking-[-0.045em] text-white">
                  {fullName}
                </div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                  {tacticalPositionLabel(player.position) || 'Hráč'}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div
        className={`relative z-30 h-[17px] ${
          flush ? 'bg-sand-100' : 'bg-sand-50'
        }`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-[13px] z-50 flex -translate-y-1/2 items-center"
          style={{ filter: 'drop-shadow(0 12px 12px rgba(24, 53, 42, 0.3))' }}
        >
          <div className="h-[7px] flex-1 bg-[#18352a]" />
          <div
            className={`grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full ring-4 ring-brand-900 ${
              flush ? 'bg-sand-100' : 'bg-sand-50'
            }`}
          >
            <ClubLogo src={team.logo_url} name={team.name} size="md" />
          </div>
          <div className="h-[7px] flex-1 bg-[#18352a]" />
        </div>
      </div>
    </section>
  )
}
