import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0b281f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,#0d3025_0%,#0b281f_48%,#071d17_100%)]" />
      <div className="pointer-events-none absolute left-[30%] top-[68%] h-[390px] w-[650px] -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[58%_42%_63%_37%/42%_57%_43%_58%] bg-brand-500/[0.28] blur-[105px] sm:h-[470px] sm:w-[780px] lg:h-[540px] lg:w-[920px]" />
      <div className="pointer-events-none absolute left-[29%] top-[66%] h-[190px] w-[360px] -translate-x-1/2 -translate-y-1/2 rotate-[9deg] rounded-[43%_57%_39%_61%/59%_38%_62%_41%] bg-[#9af0b8]/[0.34] blur-[72px] sm:h-[230px] sm:w-[430px] lg:h-[270px] lg:w-[500px]" />

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

        <div className="mt-24 grid items-end gap-8 sm:mt-28 lg:mt-36 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10">
          <div className="flex h-[138px] w-[138px] items-center justify-center sm:h-[164px] sm:w-[164px] lg:h-[206px] lg:w-[206px]">
            <img
              src="/nfc-footer-logo.webp"
              alt="Logo NFC Lichnov"
              className="h-full w-full object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,.18)]"
            />
          </div>

          <div className="min-w-0 pb-1 lg:pl-10 xl:pl-16">
            <div className="whitespace-nowrap text-[clamp(3.4rem,11.8vw,12.4rem)] font-black leading-[.72] tracking-[-0.078em] text-white">
              NFC Lichnov
            </div>
          </div>
        </div>

        <div className="mt-12 pb-4 text-[11px] font-medium text-white/[0.48] lg:mt-14">
          Vytvořil Daniel Stonawski | Všechna práva vyhrazena
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
