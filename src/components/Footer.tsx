import { ArrowUpRight, Facebook, Instagram } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://cs-cz.facebook.com/NFCLichnov/",
    icon: <Facebook size={19} strokeWidth={1.9} />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/nfc_lichnov_z.s?igsh=YXBjOGkyazJjencx",
    icon: <Instagram size={19} strokeWidth={1.9} />,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@nfc.lichnov?_r=1&_t=ZN-96ej7l3cT9K",
    icon: <TikTokIcon />,
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-900 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,#1b3b2f_0%,#18352a_46%,#143126_74%,#10291f_100%)]" />

      <div className="pointer-events-none absolute left-[30%] top-[68%] h-[390px] w-[650px] -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[58%_42%_63%_37%/42%_57%_43%_58%] bg-[#20513e]/[0.34] blur-[110px] sm:h-[470px] sm:w-[780px] lg:h-[540px] lg:w-[920px]" />
      <div className="pointer-events-none absolute left-[29%] top-[66%] h-[190px] w-[360px] -translate-x-1/2 -translate-y-1/2 rotate-[9deg] rounded-[43%_57%_39%_61%/59%_38%_62%_41%] bg-[#2a5a46]/[0.30] blur-[78px] sm:h-[230px] sm:w-[430px] lg:h-[270px] lg:w-[500px]" />

      <div className="relative mx-auto max-w-[1460px] px-5 pb-5 pt-14 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0">
          <FooterSection className="lg:pr-14">
            <FooterHeading>Klub</FooterHeading>
            <div className="mt-5 grid gap-2.5">
              <FooterLink to="/klub">O klubu</FooterLink>
              <FooterLink to="/klub/historie">Historie</FooterLink>
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

            <div className="mt-7">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">
                Sleduj nás
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.16] bg-white/[0.055] text-white/80 transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.3] hover:bg-white/[0.12] hover:text-white"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </FooterSection>
        </div>

        <div className="mt-28 flex justify-end sm:mt-32 lg:mt-40">
          <div className="min-w-0 translate-x-[2vw] pb-1 text-right lg:translate-x-[3vw]">
            <div className="whitespace-nowrap text-[clamp(3.9rem,13vw,13.5rem)] font-black leading-[.7] tracking-[-0.082em] text-white">
              NFC Lichnov
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end pb-4 text-right text-[11px] font-medium text-white/[0.48] lg:mt-14">
          Vytvořil Daniel Stonawski | Všechna práva vyhrazena
        </div>
      </div>
    </footer>
  );
}

function FooterSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">
      {children}
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="w-fit text-sm font-semibold text-white/[0.72] transition hover:translate-x-0.5 hover:text-white"
    >
      {children}
    </Link>
  );
}

function TikTokIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.2 4.2c.66 1.76 1.88 2.82 3.8 3.16v3.1a8.1 8.1 0 0 1-3.78-1.06v5.64a5.24 5.24 0 1 1-4.52-5.19v3.15a2.14 2.14 0 1 0 1.38 2V4.2h3.12Z"
        fill="currentColor"
      />
    </svg>
  );
}
