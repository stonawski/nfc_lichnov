import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Player, Team } from '../lib/types'
import { ClubLogo } from './ClubLogo'

type PlayerStripCarouselProps = {
  team: Team
  players: Player[]
  eyebrow?: string
  title?: string
  linkTo?: string
  linkLabel?: string
}

export function PlayerStripCarousel({
  team,
  players,
  eyebrow = 'Soupiska',
  title,
  linkTo,
  linkLabel = 'Celá soupiska',
}: PlayerStripCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const move = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return

    track.scrollBy({
      left: direction * Math.max(320, track.clientWidth * 0.72),
      behavior: 'smooth',
    })
  }

  return (
    <section className="player-strip relative w-full overflow-hidden bg-brand-900 text-white">
      <div className="relative z-10 mx-auto flex max-w-[1240px] items-end justify-between gap-6 px-5 pb-6 pt-10 md:px-8 md:pb-8 md:pt-12">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{eyebrow}</div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">
            {title || team.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {linkTo && (
            <Link
              to={linkTo}
              className="mr-2 hidden text-sm font-semibold text-white/65 transition hover:text-white sm:inline"
            >
              {linkLabel}
            </Link>
          )}
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Předchozí hráči"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition hover:bg-white hover:text-brand-900"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Další hráči"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition hover:bg-white hover:text-brand-900"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative z-10 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {players.map((player) => {
          const fullName = [player.first_name, player.last_name].filter(Boolean).join(' ') || 'Hráč NFC'
          // Pro tento široký carousel používáme jen ručně nahrané klubové portréty.
          // FAČR headshoty mají jiný ořez; dokud photo_url není doplněné, zobrazí se neutrální avatar.
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
                  className="absolute inset-x-0 bottom-0 h-[92%] w-full object-cover object-top transition duration-500 group-hover:scale-[1.025]"
                />
              ) : (
                <div className="absolute inset-x-0 bottom-0 flex h-[88%] items-center justify-center">
                  <div className="grid h-40 w-40 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 sm:h-44 sm:w-44">
                    <UserRound className="h-24 w-24 text-white/28 sm:h-28 sm:w-28" strokeWidth={1.25} />
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              {player.number != null && (
                <div className="absolute right-4 top-[58%] text-3xl font-black tracking-[-0.05em] text-[#e8d9a9] sm:right-5">
                  {player.number}
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
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

      <div className="relative z-20 h-7">
        <div className="absolute left-0 right-0 top-0 h-[3px] bg-brand-500" />
        <div className="absolute left-0 right-0 top-[5px] h-px bg-white/30" />
        <div className="absolute left-1/2 top-[-24px] -translate-x-1/2">
          <div className="grid h-[58px] w-[58px] place-items-center rounded-full bg-sand-50 shadow-[0_8px_24px_rgba(0,0,0,.22)] ring-4 ring-brand-900">
            <ClubLogo src={team.logo_url} name={team.name} size="md" />
          </div>
        </div>
      </div>
    </section>
  )
}
