import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ClubLogo } from './ClubLogo'

export function Footer({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <footer className="relative overflow-hidden bg-[#f7f4ed] text-brand-900">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(247,244,237,0)_0%,rgba(199,232,207,.34)_50%,rgba(82,174,110,.58)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(ellipse_at_22%_100%,rgba(0,146,63,.34),transparent_52%),radial-gradient(ellipse_at_74%_100%,rgba(137,211,156,.28),transparent_48%)]" />

      <div className="relative mx-auto max-w-[1440px] px-5 pb-6 pt-14 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[.8fr_.8fr_1.2fr] lg:gap-20">
          <FooterColumn title="Klub">
            <FooterLink to="/klub">O klubu</FooterLink>
            <FooterLink to="/klub#historie">Historie</FooterLink>
            <FooterLink to="/aktuality">Aktuality</FooterLink>
          </FooterColumn>

          <FooterColumn title="Objevuj">
            <FooterLink to="/tymy">Týmy</FooterLink>
            <FooterLink to="/zapasy">Zápasy</FooterLink>
            <FooterLink to="/galerie">Galerie</FooterLink>
          </FooterColumn>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-900/45">
              Kontakt
            </div>
            <div className="mt-4 text-base font-bold text-brand-900">
              NFC Lichnov
            </div>
            <p className="mt-2 max-w-sm text-sm leading-6 text-brand-900/58">
              Kontakty na vedení klubu, trenéry a informace ke sportovnímu
              areálu najdeš přehledně na jednom místě.
            </p>
            <Link
              to="/kontakt"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-500"
            >
              Kontaktní údaje
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div className="mt-24 grid items-end gap-7 lg:mt-32 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-10">
          <div className="flex h-[132px] w-[132px] items-center justify-center sm:h-[150px] sm:w-[150px] lg:h-[180px] lg:w-[180px]">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo NFC Lichnov"
                className="h-full w-full object-contain drop-shadow-[0_14px_28px_rgba(24,53,42,.12)]"
              />
            ) : (
              <div className="scale-[1.85]">
                <ClubLogo name="NFC Lichnov" size="lg" />
              </div>
            )}
          </div>

          <div className="min-w-0 pb-1">
            <div className="whitespace-nowrap text-[clamp(4rem,10.8vw,10.8rem)] font-black leading-[.75] tracking-[-0.075em] text-brand-900">
              NFC Lichnov
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 pb-5 text-[11px] font-medium text-brand-900/55 sm:flex-row sm:items-center sm:justify-between lg:mt-14">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/klub" className="transition hover:text-brand-900">
              O klubu
            </Link>
            <Link to="/kontakt" className="transition hover:text-brand-900">
              Kontakt
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Web vytvořil Stonawski</span>
            <span>© {new Date().getFullYear()} NFC Lichnov</span>
          </div>
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
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-900/45">
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
      className="w-fit text-sm font-semibold text-brand-900/78 transition hover:translate-x-0.5 hover:text-brand-500"
    >
      {children}
    </Link>
  )
}
