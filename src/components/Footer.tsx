import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0b281f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,#0d3025_0%,#0b281f_48%,#071d17_100%)]" />
      <div className="pointer-events-none absolute left-[30%] top-[68%] h-[360px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/35 blur-[95px] sm:h-[440px] sm:w-[720px] lg:h-[520px] lg:w-[860px]" />
      <div className="pointer-events-none absolute left-[30%] top-[70%] h-[180px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#78d69a]/20 blur-[70px]" />

      <div className="relative mx-auto max-w-[1460px] px-5 pb-5 pt-14 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0">
          <FooterSection className="lg:pr-14">
            <FooterHeading>Klub</FooterHeading>
            <div className="mt-5 grid gap-2.5">
              <FooterLink to="/klub">O klubu</FooterLink>
              <FooterLink to="/klub#historie">Historie</FooterLink>
              <FooterLink to="/aktuality">Aktuality</FooterLink>
            </div>
          </FooterSection>

          <FooterSection className="lg:border-l lg:border-white/[0.14] lg:px-14">
            <FooterHeading>Objevuj</FooterHeading>
            <div className="mt-5 grid gap-2.5">
              <FooterLink to="/tymy">Týmy</FooterLink>
              <FooterLink to="/zapasy">Zápasy</FooterLink>
              <FooterLink to="/galerie">Galerie</FooterLink>
            </div>
          </FooterSection>

          <FooterSection className="lg:border-l lg:border-white/[0.14] lg:pl-14">
            <FooterHeading>Kontakt</FooterHeading>
            <div className="mt-5 text-base font-bold text-white">
              NFC Lichnov
            </div>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/[0.58]">
              Kontakty na vedení klubu, trenéry a informace ke sportovnímu
              areálu najdeš přehledně na jednom místě.
            </p>
            <Link
              to="/kontakt"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white/80 transition hover:text-white"
            >
              Kontaktní údaje
              <ArrowUpRight size={14} />
            </Link>
          </FooterSection>
        </div>

        <div className="mt-24 grid items-end gap-8 sm:mt-28 lg:mt-36 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
          <div className="flex h-[138px] w-[138px] items-center justify-center sm:h-[164px] sm:w-[164px] lg:h-[206px] lg:w-[206px]">
            <img
              src="/nfc-footer-logo.webp"
              alt="Logo NFC Lichnov"
              className="h-full w-full object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,.18)]"
            />
          </div>

          <div className="min-w-0 pb-1">
            <div className="whitespace-nowrap text-[clamp(3rem,10.7vw,11rem)] font-black leading-[.74] tracking-[-0.075em] text-white">
              NFC Lichnov
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 pb-4 text-[11px] font-medium text-white/[0.48] sm:flex-row sm:items-center sm:justify-between lg:mt-14">
          <div>Web vytvořil Stonawski</div>
          <div>© {new Date().getFullYear()} NFC Lichnov</div>
        </div>
      </div>
    </footer>
  )
}

function FooterSection({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">
      {children}
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
      className="w-fit text-sm font-semibold text-white/[0.72] transition hover:translate-x-0.5 hover:text-white"
    >
      {children}
    </Link>
  )
}
