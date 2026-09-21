import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ClubLogo } from './ClubLogo'

export function Footer({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <footer className="relative overflow-hidden bg-brand-900 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,#18352a_0%,#12392a_44%,#0f2f24_72%,#0a241b_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,146,63,.13),transparent_34%),radial-gradient(circle_at_84%_82%,rgba(255,255,255,.035),transparent_36%)]" />
      <div className="relative">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 pb-5 pt-10 sm:flex-row sm:items-center sm:justify-between md:px-8 md:pb-6 md:pt-12">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-white">
              <ClubLogo src={logoUrl} name="NFC Lichnov" size="md" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                NFC Lichnov
              </div>
              <div className="mt-1 max-w-xl text-xl font-extrabold leading-tight tracking-[-0.035em] sm:text-2xl">
                Oficiální web NFC Lichnov
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 pb-10 pt-7 sm:grid-cols-2 md:px-8 lg:grid-cols-[1.35fr_.72fr_.82fr_1fr] lg:gap-14 lg:py-14">
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

      <div className="relative">
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
