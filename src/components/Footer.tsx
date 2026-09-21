import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ClubLogo } from './ClubLogo'

export function Footer({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <footer className="relative overflow-hidden bg-brand-900 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,#18352a_0%,#123126_48%,#0b271d_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.9)_0,rgba(255,255,255,.9)_1px,transparent_1px,transparent_28px)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-500/70" />
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-9 sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-11">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-white">
              <ClubLogo src={logoUrl} name="NFC Lichnov" size="md" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                NFC Lichnov
              </div>
              <div className="mt-1 max-w-xl text-xl font-extrabold leading-tight tracking-[-0.035em] sm:text-2xl">
                Fotbal v Lichnově. Od nejmenších až po muže.
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 py-12 sm:grid-cols-2 md:px-8 lg:grid-cols-[1.35fr_.72fr_.82fr_1fr] lg:gap-14 lg:py-14">
        <div>
          <div className="text-3xl font-black tracking-[-0.055em]">
            NFC Lichnov
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/[0.58]">
            Výsledky, zápasy, hráči, aktuality a život klubu na jednom místě.
            Přehledně pro fanoušky, rodiče i všechny, kteří jsou součástí NFC.
          </p>
        </div>

        <FooterColumn title="Navigace">
          <FooterLink to="/tymy">Týmy</FooterLink>
          <FooterLink to="/zapasy">Zápasy</FooterLink>
          <FooterLink to="/aktuality">Aktuality</FooterLink>
          <FooterLink to="/galerie">Galerie</FooterLink>
        </FooterColumn>

        <FooterColumn title="Klub">
          <FooterLink to="/klub">O klubu</FooterLink>
          <FooterLink to="/klub#historie">Historie</FooterLink>
          <FooterLink to="/klub#areal">Sportovní areál</FooterLink>
        </FooterColumn>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
            Kontakt
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/[0.62]">
            Hledáš kontakt na trenéra, vedení klubu nebo informace k areálu?
          </p>
          <Link
            to="/kontakt"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-white/[0.1]"
          >
            Kontaktní údaje
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div>© {new Date().getFullYear()} NFC Lichnov</div>

          <div>Web vytvořil Stonawski</div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
        {title}
      </div>
      <div className="mt-4 grid gap-2.5">{children}</div>
    </div>
  )
}

function FooterLink({
  to,
  children,
}: {
  to: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className="w-fit text-sm font-medium text-white/[0.68] transition hover:translate-x-0.5 hover:text-white"
    >
      {children}
    </Link>
  )
}
