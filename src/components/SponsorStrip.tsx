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
      className="border-t border-brand-900/[0.08] bg-[#f7f3e8] py-8 sm:py-10"
      aria-labelledby="sponsor-strip-heading"
    >
      <div className="mx-auto flex max-w-[1460px] items-end justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-brand-500">
            Děkujeme za podporu
          </div>
          <h2
            id="sponsor-strip-heading"
            className="mt-1 text-xl font-black tracking-[-0.04em] text-brand-900 sm:text-2xl"
          >
            Partneři NFC Lichnov
          </h2>
        </div>

        <div className="hidden text-right text-[10px] font-semibold text-ink-500 sm:block">
          Klub drží pohromadě i díky nim.
        </div>
      </div>

      <div className="sponsor-marquee mt-6 overflow-hidden">
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
        <SponsorItem key={`${partner.name}-${duplicate ? 'duplicate' : 'primary'}`} partner={partner} />
      ))}
    </div>
  )
}

function SponsorItem({
  partner,
}: {
  partner: (typeof PARTNERS)[number]
}) {
  const content = (
    <div className="flex h-[92px] w-[210px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-brand-900/[0.08] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(24,53,42,.035)] sm:h-[108px] sm:w-[255px] sm:px-5 sm:py-4">
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
        aria-label={partner.name}
        className="shrink-0 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {content}
      </a>
    )
  }

  return <div className="shrink-0" title={partner.name}>{content}</div>
}
