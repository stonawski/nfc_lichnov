import { UserRound } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Player, Team } from '../lib/types'
import { ClubLogo } from './ClubLogo'

type PlayerStripCarouselProps = {
  team: Team
  players: Player[]
}

export function PlayerStripCarousel({ team, players }: PlayerStripCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const track = trackRef.current
    if (!track) return

    setDragging(true)
    dragStartX.current = event.clientX
    dragStartScroll.current = track.scrollLeft
    track.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || event.pointerType !== 'mouse') return
    const track = trackRef.current
    if (!track) return

    const delta = event.clientX - dragStartX.current
    track.scrollLeft = dragStartScroll.current - delta
  }

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    setDragging(false)

    const track = trackRef.current
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <section className="player-strip relative w-full overflow-hidden bg-brand-900 text-white">
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={(event) => {
          if (dragging) stopDragging(event)
        }}
        className={`relative z-10 flex snap-x snap-mandatory overflow-x-auto select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          dragging ? 'cursor-grabbing snap-none' : 'cursor-grab'
        }`}
      >
        {players.map((player) => {
          const fullName = [player.first_name, player.last_name].filter(Boolean).join(' ') || 'Hráč NFC'
          // V tomto hero carouselu používáme pouze klubové portréty.
          // Dokud photo_url není doplněné, zobrazí se neutrální avatar.
          const photo = player.photo_url

          return (
            <article
              key={player.id}
              className="player-strip-card group relative h-[350px] w-[72vw] max-w-[310px] shrink-0 snap-start overflow-hidden border-r border-white/10 sm:h-[390px] sm:w-[42vw] md:w-[31vw] lg:h-[420px] lg:w-[14.285vw] lg:max-w-none"
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
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[88%] items-center justify-center">
                  <div className="grid h-40 w-40 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 sm:h-44 sm:w-44">
                    <UserRound className="h-24 w-24 text-white/28 sm:h-28 sm:w-28" strokeWidth={1.25} />
                  </div>
                </div>
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
                  {player.position || 'Hráč'}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="relative z-20 h-16">
        <div className="absolute left-0 right-0 top-0 h-[3px] bg-brand-500" />
        <div className="absolute left-0 right-0 top-[5px] h-px bg-white/30" />
        <div className="absolute left-1/2 top-[-25px] -translate-x-1/2">
          <div className="grid h-[62px] w-[62px] place-items-center rounded-full bg-sand-50 shadow-[0_8px_24px_rgba(0,0,0,.22)] ring-4 ring-brand-900">
            <ClubLogo src={team.logo_url} name={team.name} size="md" />
          </div>
        </div>
      </div>
    </section>
  )
}
