const PARTNERS = [
  {
    name: "NORD PLD",
    image: "/sponsors/nord.webp",
  },
  {
    name: "AGROCAR",
    href: "https://www.agrocar.cz/",
    image: "/sponsors/agrocar.webp",
  },
  {
    name: "STIHL",
    href: "https://www.agrocar.cz/",
    image: "/sponsors/stihl.webp",
  },
  {
    name: "EPO GEARMOT",
    href: "https://www.epogm.com/",
    image: "/sponsors/epogm.webp",
  },
  {
    name: "ZD Javorník",
    image: "/sponsors/zd_javornik.webp",
  },
  {
    name: "Allianz · Jiří Holub",
    image: "/sponsors/holub.webp",
  },
  {
    name: "Hummel",
    href: "https://www.hummel.net/",
    image: "/sponsors/hummel.webp",
  },
  {
    name: "Tomáš Střalka · DPZ",
    href: "https://www.stralka.cz/",
    image: "/sponsors/stralka.webp",
  },
  {
    name: "Klempířství Zdeněk Matůš",
    image: "/sponsors/matus.webp",
  },
  {
    name: "Auto Horečka",
    href: "https://www.auto-horecka.cz/",
    image: "/sponsors/autohorecka.webp",
  },
  {
    name: "Obec Lichnov",
    href: "https://www.lichnov.cz/",
    image: "/sponsors/obec.webp",
  },
  {
    name: "Kamenictví Oczadly",
    image: "/sponsors/oczadly.webp",
  },
  {
    name: "Rožnovské traviny",
    href: "https://www.roznovska-travni.cz/",
    image: "/sponsors/roznov.webp",
  },
] as const;

export function SponsorStrip() {
  return (
    <section
      className="border-t border-brand-900/[0.07] bg-white py-5 sm:py-6"
      aria-label="Partneři NFC Lichnov"
    >
      <div className="sponsor-marquee overflow-hidden">
        <div className="sponsor-track flex w-max">
          <SponsorGroup />
          <SponsorGroup duplicate />
        </div>
      </div>
    </section>
  );
}

function SponsorGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className="sponsor-group flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4"
      aria-hidden={duplicate || undefined}
    >
      {PARTNERS.map((partner) => (
        <SponsorItem
          key={`${partner.name}-${duplicate ? "duplicate" : "primary"}`}
          partner={partner}
          duplicate={duplicate}
        />
      ))}
    </div>
  );
}

function SponsorItem({
  partner,
  duplicate,
}: {
  partner: (typeof PARTNERS)[number];
  duplicate: boolean;
}) {
  const content = (
    <div className="flex h-[86px] w-[210px] shrink-0 items-center justify-center overflow-hidden px-5 py-3 sm:h-[98px] sm:w-[250px] sm:px-6">
      {partner.image ? (
        <img
          src={partner.image}
          alt={partner.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="text-center">
          <div className="text-xl font-black tracking-[-0.045em] text-brand-900 sm:text-2xl">
            OneMobile
          </div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-500">
            Vodafone partner
          </div>
        </div>
      )}
    </div>
  );

  if ("href" in partner && partner.href) {
    return (
      <a
        href={partner.href}
        target="_blank"
        rel="noreferrer"
        aria-label={duplicate ? undefined : partner.name}
        tabIndex={duplicate ? -1 : undefined}
        className="shrink-0 transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="shrink-0" title={duplicate ? undefined : partner.name}>
      {content}
    </div>
  );
}
