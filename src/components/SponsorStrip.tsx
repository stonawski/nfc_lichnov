const PARTNERS = [
  {
    name: 'OneMobile / Vodafone',
    href: 'https://www.onemobile.cz/',
    image: null,
  },
  {
    name: 'NORD PLD',
    image: 'https://nfclichnov.wbs.cz/Sponzori/Nord_Pld.jpg',
  },
  {
    name: 'ZD Javorník',
    image: 'https://nfclichnov.wbs.cz/zd_javornik.jpg',
  },
  {
    name: 'Allianz · Jiří Holub',
    image: 'https://nfclichnov.wbs.cz/all_auto_obr_.png',
  },
  {
    name: 'Podlahy Zbránek',
    image: 'https://nfclichnov.wbs.cz/reklama.jpg',
  },
  {
    name: 'Tomáš Strálka · Moragro',
    image: 'https://nfclichnov.wbs.cz/Vizitka.jpg',
  },
  {
    name: 'Klempířství Zdeněk Matůš',
    image: 'https://nfclichnov.wbs.cz/klempirstvi.jpg',
  },
] as const

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
  )
}

function SponsorGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className="sponsor-group flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4"
      aria-hidden={duplicate || undefined}
    >
      {PARTNERS.map((partner) => (
        <SponsorItem
          key={`${partner.name}-${duplicate ? 'duplicate' : 'primary'}`}
          partner={partner}
          duplicate={duplicate}
        />
      ))}
    </div>
  )
}

function SponsorItem({
  partner,
  duplicate,
}: {
  partner: (typeof PARTNERS)[number]
  duplicate: boolean
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
  )

  if ('href' in partner && partner.href) {
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
    )
  }

  return <div className="shrink-0" title={duplicate ? undefined : partner.name}>{content}</div>
}
