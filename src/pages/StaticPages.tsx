import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Facebook,
  Flag,
  Images,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Shield,
  Trophy,
  Users,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HeroFieldBackdrop } from '../components/HeroFieldBackdrop'
import { AlbumOverlay, Lightbox } from './GalleryPage'
import { fetchGalleries, fetchGalleryImages } from '../lib/data'

const CLUB_ADDRESS = 'Lichnov 286, 742 75 Lichnov'
const CLUB_GPS = '49.5681739,18.1676489'

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://cs-cz.facebook.com/NFCLichnov/',
    icon: <Facebook size={20} />,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/nfc_lichnov_z.s?igsh=YXBjOGkyazJjencx',
    icon: <Instagram size={20} />,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@nfc.lichnov?_r=1&_t=ZN-96ej7l3cT9K',
    icon: <TikTokIcon />,
  },
]

export function ClubPage() {
  return (
    <main>
      <ClubHero
        eyebrow="NFC Lichnov"
        title="Fotbal v Lichnově od roku 1963."
        text="Klub s dlouhou historií, vlastním zázemím a kategoriemi od nejmenších až po dospělé."
      >
        <div className="mt-10 grid max-w-[760px] grid-cols-3 overflow-hidden rounded-[24px] border border-brand-900/10 bg-white/55 backdrop-blur-sm">
          <HeroFact value="1963" label="začátek fotbalu" />
          <HeroFact value="1994" label="vznik NFC" />
          <HeroFact value="Lichnov" label="domov klubu" />
        </div>
      </ClubHero>

      <section className="bg-brand-900 px-5 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <SectionEyebrow light>Základní informace</SectionEyebrow>
            <h2 className="mt-3 max-w-xl text-4xl font-black leading-[.98] tracking-[-0.055em] text-white md:text-5xl">
              Jeden klub. Jedno místo. Desítky let fotbalu.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/60">
              NFC Lichnov navazuje na fotbalový oddíl TJ Sokol Lichnov. Dnešní
              spolek vznikl v roce 1994 jako přímý pokračovatel místního
              fotbalu, jehož začátky sahají do roku 1963.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile dark label="Rok založení" value="27. 10. 1963" icon={<CalendarDays size={18} />} />
            <InfoTile dark label="Název oddílu" value="NFC Lichnov, z.s." icon={<Shield size={18} />} />
            <InfoTile dark label="Číslo oddílu" value="8040231" icon={<Trophy size={18} />} />
            <InfoTile dark label="Klubové barvy" value="Zelená · modrá · bílá" icon={<Flag size={18} />} />
          </div>
        </div>
      </section>

      <section className="bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <SectionEyebrow>Vedení klubu</SectionEyebrow>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900">
                Lidé za NFC.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-ink-500">
                Kontakty na realizační týmy jednotlivých kategorií najdeš vždy
                přímo u daného týmu. Tady uvádíme vedení spolku.
              </p>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-sand-200 bg-white">
              <PersonRow role="Předseda" name="Ing. Jiří Holub" />
              <PersonRow role="Místopředseda" name="Jiří Drozd" />
              <PersonRow
                role="Tajemník"
                name="René Stonawski"
                detail="+420 604 277 488"
                href="tel:+420604277488"
              />
              <PersonRow
                role="Členové výboru"
                name="Milan Klimeš · Petr Drozd · Radim Špaček · Miroslav Drozd · Roman Goch"
                compact
              />
              <PersonRow
                role="Revizní komise"
                name="Tomáš Ševčík · Pavel Mičulka · Jaroslav Slanina"
                compact
                last
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <SectionEyebrow>Poznej klub</SectionEyebrow>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 md:text-5xl">
            Historie, čísla, areál i kontakt.
          </h2>

          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ExploreCard
              to="/klub/historie"
              eyebrow="Od roku 1963"
              title="Historie klubu"
              text="Od TJ Sokol Lichnov přes vznik NFC až po modernizaci areálu a mládež."
            />
            <ExploreCard
              to="/klub/statistiky"
              eyebrow="Historie v číslech"
              title="Statistiky"
              text="Rekordmani v počtu zápasů, nejlepší střelci a archiv jednotlivých sezon."
            />
            <ExploreCard
              to="/klub/areal"
              eyebrow="NFC Lichnov aréna"
              title="Sportovní areál"
              text="Kapacita, rozměry hřiště, tribuna, GPS a praktické informace pro návštěvu."
            />
            <ExploreCard
              to="/kontakt"
              eyebrow="Spojení na klub"
              title="Kontakt"
              text="Adresa, e-maily, telefon a odkazy na sociální sítě NFC Lichnov."
            />
          </div>
        </div>
      </section>
    </main>
  )
}

export function HistoryPage() {
  const milestones = [
    {
      year: '1963',
      title: 'Začíná fotbal v Lichnově',
      text: 'Fotbalový klub byl založen na podzim roku 1963 pod názvem TJ Sokol Lichnov. Klub uvádí jako datum založení 27. říjen 1963.',
    },
    {
      year: '1994',
      title: 'Vzniká NFC Lichnov',
      text: 'Na ustavující valné hromadě 3. března 1994 vznikl fotbalový oddíl NFC Lichnov. Dne 21. března byl registrován jako občanské sdružení a navázal přímo na TJ Sokol Lichnov.',
    },
    {
      year: '1999',
      title: 'Nové travnaté hřiště',
      text: 'Po přibližně dvouleté modernizaci původního škvárového hřiště byl 30. července 1999 slavnostně otevřen travnatý povrch se zavlažováním, novým oplocením, parkovištěm a upraveným okolím.',
    },
    {
      year: '2000',
      title: 'Modernizace zázemí',
      text: 'V březnu 2000 proběhla plynofikace topení a rekonstrukce sociálního zařízení. Areál se postupně měnil v zázemí odpovídající krajskému fotbalu.',
    },
    {
      year: '2006',
      title: 'Přichází přípravka',
      text: 'Na jaře 2006 klub založil oddíl benjamínků – přípravku – a ihned jej přihlásil do okresní soutěže.',
    },
    {
      year: 'Dnes',
      title: 'Fotbal napříč generacemi',
      text: 'NFC Lichnov dnes staví na společném zázemí, mládežnických kategoriích a A-týmu. Historie klubu pokračuje každou další sezonou.',
    },
  ]

  return (
    <main>
      <ClubHero
        eyebrow="Historie klubu"
        title="Více než šedesát let fotbalu."
        text="Příběh NFC Lichnov začal jako TJ Sokol Lichnov a postupně vyrostl v dnešní klub se zázemím pro všechny generace."
      >
        <div className="mt-10 grid max-w-[900px] grid-cols-2 overflow-hidden rounded-[24px] border border-brand-900/10 bg-white/55 backdrop-blur-sm sm:grid-cols-4">
          <HeroFact value="1963" label="založení oddílu" />
          <HeroFact value="1994" label="vznik NFC" />
          <HeroFact value="1999" label="travnaté hřiště" />
          <HeroFact value="2006" label="vznik přípravky" />
        </div>
      </ClubHero>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid gap-5">
            {milestones.map((item, index) => (
              <article
                key={item.year}
                className="grid gap-4 rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-6 sm:grid-cols-[140px_1fr] sm:p-8"
              >
                <div>
                  <div className="text-4xl font-black tracking-[-0.06em] text-brand-500">
                    {item.year}
                  </div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.17em] text-ink-500">
                    {index === milestones.length - 1 ? 'Pokračujeme' : 'Milník'}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-brand-900 sm:text-3xl">
                    {item.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-500 sm:text-base">
                    {item.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-8 rounded-[38px] bg-brand-900 p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              Místo, které rostlo s klubem
            </div>
            <h2 className="mt-3 max-w-2xl text-4xl font-black leading-[.98] tracking-[-0.055em] md:text-5xl">
              Historie je vidět i na našem areálu.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">
              Travnaté hřiště z roku 1999, zavlažování, tribuna a další
              modernizace vytvořily dnešní NFC Lichnov arénu.
            </p>
          </div>
          <Link
            to="/klub/areal"
            className="inline-flex w-fit items-center gap-2 rounded-[16px] bg-white px-5 py-3 text-sm font-bold text-brand-900 transition-colors hover:bg-brand-50"
          >
            Prohlédnout areál <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  )
}

export function ArealPage() {
  const [albumOpen, setAlbumOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)

  const galleriesQuery = useQuery({
    queryKey: ['galleries'],
    queryFn: fetchGalleries,
    retry: false,
  })

  const arealGallery = (galleriesQuery.data ?? []).find((gallery) =>
    normalizeStaticText(gallery.title).includes('areal'),
  )

  const imagesQuery = useQuery({
    queryKey: ['gallery-images', arealGallery?.id],
    queryFn: () => fetchGalleryImages(arealGallery!.id),
    enabled: Boolean(arealGallery?.id),
    retry: false,
    staleTime: 5 * 60_000,
  })

  const arealImages = imagesQuery.data ?? []
  const activeImage =
    activeImageIndex == null ? null : arealImages[activeImageIndex] ?? null

  useEffect(() => {
    if (!albumOpen) return

    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [albumOpen])

  const closeAlbum = () => {
    setActiveImageIndex(null)
    setAlbumOpen(false)
  }

  return (
    <main>
      <section className="relative -mt-[84px] overflow-hidden px-5 pb-14 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
        <HeroFieldBackdrop />

        <div className="relative mx-auto w-full max-w-[1240px] py-8 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <div className="max-w-[720px]">
              <SectionEyebrow>Sportovní areál</SectionEyebrow>
              <h1 className="mt-4 text-[clamp(3.1rem,7vw,6.4rem)] font-black leading-[.88] tracking-[-0.072em] text-brand-900">
                Stadion NFC Lichnov.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
                Domácí hřiště klubu, tribuna pro fanoušky a zázemí, které se v Lichnově buduje už desítky let.
              </p>
            </div>

            <div className="grid overflow-hidden rounded-[28px] bg-brand-900 text-white shadow-[0_18px_50px_rgba(24,53,42,.12)] sm:grid-cols-2">
              <ArealHeroStat value="1 000" label="kapacita stadionu" />
              <ArealHeroStat value="cca 200" label="krytých míst" />
              <ArealHeroStat value="98 × 66 m" label="hlavní hřiště" />
              <ArealHeroStat value="1999" label="travnatá plocha" />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              'Částečně krytá tribuna',
              'Automatické zavlažování',
              'Výsledková tabule',
              'Zábrany za brankami',
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-brand-900/10 bg-white/70 px-3.5 py-2 text-[10px] font-bold text-brand-900 backdrop-blur"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <SectionEyebrow>Zázemí</SectionEyebrow>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 md:text-5xl">
              Hřiště, tribuna, zavlažování.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-ink-500 sm:text-base">
              Areál tvoří jedno hlavní travnaté fotbalové hřiště. Na severní
              straně je částečně krytá tribuna. Součástí areálu je automatické
              zavlažování, výsledková tabule a velkoplošné zábrany za brankami.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="Vlastník areálu" value="Obec Lichnov" icon={<Building2 size={18} />} />
            <InfoTile label="Správce hřiště" value="Miroslav Drozd" icon={<Users size={18} />} />
            <InfoTile label="Výsledková tabule" value="Ano" icon={<Trophy size={18} />} />
            <InfoTile label="Zábrany za brankami" value="Ano" icon={<Shield size={18} />} />
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid overflow-hidden rounded-[38px] border border-sand-200 bg-[#fbfaf6] lg:grid-cols-[1.15fr_.85fr]">
            <div className="relative min-h-[360px] overflow-hidden">
              <img
                src={arealGallery?.cover_image || '/hero-lichnov-field.webp'}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-900/12 via-transparent to-brand-900/10" />
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
                <Images size={14} />
                Fotky z areálu
              </div>
              <h2 className="mt-3 text-4xl font-black leading-[.98] tracking-[-0.055em] text-brand-900">
                Projdi si stadion i obrazem.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-ink-500">
                V galerii najdeš fotografie hlavní plochy, tribuny i okolí stadionu.
                Album Areál můžeš otevřít přímo tady bez opuštění stránky.
              </p>

              {arealGallery ? (
                <button
                  type="button"
                  onClick={() => setAlbumOpen(true)}
                  disabled={imagesQuery.isLoading}
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-[15px] bg-brand-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {imagesQuery.isLoading ? 'Načítám fotky…' : 'Otevřít album Areál'}
                  <ArrowRight size={14} />
                </button>
              ) : (
                <Link
                  to="/galerie"
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-[15px] bg-brand-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
                >
                  Otevřít galerii <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-6 lg:grid-cols-[1fr_.72fr]">
          <div className="overflow-hidden rounded-[38px] bg-brand-900 p-7 text-white sm:p-10">
            <SectionEyebrow light>Kde nás najdete</SectionEyebrow>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Lichnov 286.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/60">
              GPS souřadnice areálu jsou 49.5681739 N, 18.1676489 E.
            </p>
            <a
              href={`https://www.google.com/maps?q=${CLUB_GPS}`}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-[15px] bg-white px-4 py-2.5 text-sm font-bold text-brand-900 transition-colors hover:bg-brand-50"
            >
              Otevřít v mapách <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="rounded-[38px] border border-sand-200 bg-[#fbfaf6] p-7 sm:p-9">
            <MapPin size={24} className="text-brand-500" />
            <div className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
              Adresa
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-brand-900">
              {CLUB_ADDRESS}
            </div>
            <div className="mt-7 border-t border-sand-200 pt-6 text-sm leading-6 text-ink-500">
              Při větších utkáních a turnajích doporučujeme počítat s vyšším
              provozem v okolí areálu.
            </div>
          </div>
        </div>
      </section>

      {albumOpen && arealGallery && (
        <AlbumOverlay
          gallery={arealGallery}
          images={arealImages}
          onClose={closeAlbum}
          onOpenImage={setActiveImageIndex}
          lightboxOpen={activeImageIndex != null}
        />
      )}

      {albumOpen && activeImage && activeImageIndex != null && (
        <Lightbox
          image={activeImage}
          index={activeImageIndex}
          count={arealImages.length}
          onClose={() => setActiveImageIndex(null)}
          onPrevious={() =>
            setActiveImageIndex(
              (activeImageIndex - 1 + arealImages.length) % arealImages.length,
            )
          }
          onNext={() =>
            setActiveImageIndex((activeImageIndex + 1) % arealImages.length)
          }
        />
      )}
    </main>
  )
}

export function ContactPage() {
  const contactRoutes = [
    {
      eyebrow: 'Obecné dotazy',
      title: 'Napište klubu',
      text: 'Pro organizační a klubové záležitosti použijte hlavní klubový e-mail.',
      href: 'mailto:nfclichnov@seznam.cz',
      icon: <Mail size={19} />,
      external: true,
    },
    {
      eyebrow: 'Hráči a tréninky',
      title: 'Týmy a trenéři',
      text: 'Kontakty na realizační týmy hledejte přímo u jednotlivých kategorií.',
      href: '/tymy',
      icon: <Users size={19} />,
      external: false,
    },
    {
      eyebrow: 'Spolek',
      title: 'Vedení NFC',
      text: 'Předseda, místopředseda, tajemník, výbor a revizní komise.',
      href: '/klub',
      icon: <Shield size={19} />,
      external: false,
    },
    {
      eyebrow: 'Návštěva',
      title: 'Sportovní areál',
      text: 'Adresa, poloha, parametry stadionu a fotografie areálu.',
      href: '/klub/areal',
      icon: <MapPin size={19} />,
      external: false,
    },
  ]

  const trainingTimes = [
    { team: 'Muži', days: 'Úterý · čtvrtek', time: '16:00' },
    { team: 'Dorost', days: 'Úterý · čtvrtek', time: null },
    { team: 'Žáci', days: 'Pondělí · středa', time: null },
    { team: 'Přípravky', days: 'Pondělí · středa', time: null },
  ]

  return (
    <main>
      <section className="relative -mt-[84px] overflow-hidden px-5 pb-14 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
        <HeroFieldBackdrop />

        <div className="relative mx-auto w-full max-w-[1240px] py-8 md:py-12">
          <div className="max-w-[820px]">
            <SectionEyebrow>Kontakt</SectionEyebrow>
            <h1 className="mt-4 text-[clamp(3.1rem,7vw,6.4rem)] font-black leading-[.88] tracking-[-0.072em] text-brand-900">
              Ozvěte se NFC Lichnov.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
              Vyber si nejrychlejší cestu podle toho, co potřebuješ řešit. Základní spojení na klub máš rovnou tady.
            </p>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-[30px] border border-brand-900/10 bg-white/70 backdrop-blur-sm md:grid-cols-3">
            <HeroContactLink
              icon={<Mail size={18} />}
              label="E-mail"
              value="nfclichnov@seznam.cz"
              href="mailto:nfclichnov@seznam.cz"
            />
            <HeroContactLink
              icon={<Phone size={18} />}
              label="Telefon"
              value="+420 604 277 488"
              href="tel:+420604277488"
            />
            <HeroContactLink
              icon={<MapPin size={18} />}
              label="Adresa"
              value={CLUB_ADDRESS}
              href={`https://www.google.com/maps?q=${CLUB_GPS}`}
              external
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-900 px-5 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="max-w-2xl">
            <SectionEyebrow light>Kam se obrátit</SectionEyebrow>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-white md:text-5xl">
              Správný kontakt bez hledání.
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/55 sm:text-base">
              Ne každý dotaz musí jít přes stejné místo. Vyber si oblast a pokračuj rovnou tam, kde ji klub řeší.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {contactRoutes.map((item) => {
              const className =
                'group flex min-h-[220px] flex-col justify-between rounded-[28px] border border-white/10 bg-white/[0.055] p-5 transition-colors hover:border-brand-500/30 hover:bg-white/[0.085]'

              const content = (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-white/10 text-brand-500">
                      {item.icon}
                    </div>
                    <ArrowUpRight size={16} className="text-white/35 transition-colors group-hover:text-brand-500" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand-500">
                      {item.eyebrow}
                    </div>
                    <div className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-white">
                      {item.title}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-white/50">{item.text}</p>
                  </div>
                </>
              )

              return item.external ? (
                <a key={item.title} href={item.href} className={className}>
                  {content}
                </a>
              ) : (
                <Link key={item.title} to={item.href} className={className}>
                  {content}
                </Link>
              )
            })}
          </div>

          <div className="mt-14 border-t border-white/10 pt-10">
            <div className="grid gap-8 lg:grid-cols-[.62fr_1.38fr] lg:items-end">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
                  Chceš se přidat?
                </div>
                <h3 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                  Přijď se podívat na trénink.
                </h3>
                <p className="mt-4 max-w-lg text-sm leading-7 text-white/55">
                  Níže jsou pravidelné tréninkové dny. U kategorií bez uvedeného času si aktuální hodinu ověř u realizačního týmu.
                </p>
                <Link
                  to="/tymy"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-brand-500"
                >
                  Kontakty na týmy <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid gap-px overflow-hidden rounded-[26px] border border-white/10 bg-white/10 sm:grid-cols-2">
                {trainingTimes.map((training) => (
                  <div key={training.team} className="bg-brand-900 p-5 sm:p-6">
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand-500">
                      {training.team}
                    </div>
                    <div className="mt-3 text-lg font-extrabold text-white">
                      {training.days}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white/45">
                      {training.time ? training.time : 'čas dle realizačního týmu'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <SectionEyebrow>Sleduj NFC</SectionEyebrow>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 md:text-5xl">
              Klub žije i mimo hřiště.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-ink-500">
              Aktuality, fotografie, výsledky turnajů a další dění najdeš také
              na oficiálních sociálních profilech klubu.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[150px] flex-col justify-between rounded-[28px] border border-sand-200 bg-[#fbfaf6] p-5 transition-colors hover:border-brand-500/20 hover:bg-brand-50/25"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  {social.icon}
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div className="text-xl font-extrabold tracking-[-0.035em] text-brand-900">
                    {social.label}
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-ink-500 transition-colors group-hover:text-brand-500"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-[38px] bg-brand-900 text-white lg:grid-cols-[1fr_.82fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <SectionEyebrow light>Chystáte se k nám?</SectionEyebrow>
            <h2 className="mt-3 max-w-xl text-4xl font-black leading-[.98] tracking-[-0.055em] md:text-5xl">
              Domácí zápasy hrajeme v Lichnově.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/60">
              Stadion najdeš na adrese {CLUB_ADDRESS}. Podrobnosti o areálu, tribuně a poloze jsou na samostatné stránce.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`https://www.google.com/maps?q=${CLUB_GPS}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-[15px] bg-white px-4 py-2.5 text-sm font-bold text-brand-900 transition-colors hover:bg-brand-50"
              >
                Otevřít mapu <ArrowUpRight size={14} />
              </a>
              <Link
                to="/klub/areal"
                className="inline-flex items-center gap-2 rounded-[15px] border border-white/15 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Informace o areálu <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Klubové spojení
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <div className="text-xs text-white/40">NFC Lichnov, z.s.</div>
                <div className="mt-1 text-lg font-extrabold">nfclichnov@seznam.cz</div>
              </div>
              <div>
                <div className="text-xs text-white/40">Tajemník · René Stonawski</div>
                <div className="mt-1 text-lg font-extrabold">+420 604 277 488</div>
                <a
                  href="mailto:r.stonawski@gmail.com"
                  className="mt-1 inline-block text-sm text-white/55 transition-colors hover:text-white"
                >
                  r.stonawski@gmail.com
                </a>
              </div>
              <div className="border-t border-white/10 pt-5 text-sm leading-6 text-white/50">
                Pro konkrétní tým nebo trénink použij stránku dané kategorie, kde najdeš realizační tým.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ClubHero({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string
  title: string
  text: string
  children?: ReactNode
}) {
  return (
    <section className="site-hero-frame relative -mt-[84px] flex flex-col overflow-hidden px-5 pb-14 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
      <HeroFieldBackdrop />

      <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 items-center py-8 md:py-12">
        <div className="w-full max-w-[900px]">
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
          <h1 className="mt-4 max-w-[820px] text-[clamp(3.1rem,7vw,6.6rem)] font-black leading-[.88] tracking-[-0.072em] text-brand-900">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
            {text}
          </p>
          {children}
        </div>
      </div>
    </section>
  )
}

function HeroFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-r border-brand-900/10 px-4 py-4 last:border-r-0 sm:px-5">
      <div className="text-xl font-black tracking-[-0.045em] text-brand-900 sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.13em] text-ink-500 sm:text-[9px]">
        {label}
      </div>
    </div>
  )
}

function ArealHeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-b border-white/10 p-5 last:border-b-0 sm:border-b sm:border-r sm:p-6 sm:nth-[2n]:border-r-0 sm:nth-[n+3]:border-b-0">
      <div className="text-2xl font-black tracking-[-0.05em] text-white">
        {value}
      </div>
      <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
        {label}
      </div>
    </div>
  )
}

function HeroContactLink({
  icon,
  label,
  value,
  href,
  external = false,
}: {
  icon: ReactNode
  label: string
  value: string
  href: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="group flex min-h-[112px] items-center gap-4 border-b border-brand-900/10 px-5 py-5 transition-colors hover:bg-white md:border-b-0 md:border-r md:last:border-r-0 sm:px-6"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-brand-50 text-brand-700">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-ink-500">
          {label}
        </span>
        <span className="mt-1 block break-words text-sm font-extrabold text-brand-900 sm:text-base">
          {value}
        </span>
      </span>
      <ArrowUpRight size={14} className="ml-auto shrink-0 text-ink-500 transition-colors group-hover:text-brand-500" />
    </a>
  )
}

function normalizeStaticText(value: string) {
  return value
    .toLocaleLowerCase('cs-CZ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function SectionEyebrow({
  children,
  light = false,
}: {
  children: ReactNode
  light?: boolean
}) {
  return (
    <div
      className={`text-[10px] font-bold uppercase tracking-[0.18em] sm:text-xs ${
        light ? 'text-white/45' : 'text-brand-500'
      }`}
    >
      {children}
    </div>
  )
}

function InfoTile({
  label,
  value,
  icon,
  dark = false,
}: {
  label: string
  value: string
  icon: ReactNode
  dark?: boolean
}) {
  return (
    <div
      className={`rounded-[28px] p-5 ${
        dark
          ? 'border border-white/10 bg-white/[0.06]'
          : 'border border-sand-200 bg-[#fbfaf6]'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div
          className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
            dark ? 'text-white/45' : 'text-ink-500'
          }`}
        >
          {label}
        </div>
        <div className="text-brand-500">{icon}</div>
      </div>
      <div
        className={`mt-5 text-xl font-extrabold tracking-[-0.035em] ${
          dark ? 'text-white' : 'text-brand-900'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function PersonRow({
  role,
  name,
  detail,
  href,
  compact = false,
  last = false,
}: {
  role: string
  name: string
  detail?: string
  href?: string
  compact?: boolean
  last?: boolean
}) {
  return (
    <div
      className={`grid gap-2 px-6 py-5 sm:grid-cols-[160px_1fr] sm:items-center sm:px-7 ${
        last ? '' : 'border-b border-sand-200'
      }`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
        {role}
      </div>
      <div>
        <div
          className={`font-extrabold tracking-[-0.03em] text-brand-900 ${
            compact ? 'text-sm leading-6 sm:text-base' : 'text-lg'
          }`}
        >
          {name}
        </div>
        {detail &&
          (href ? (
            <a
              href={href}
              className="mt-1 inline-block text-sm font-semibold text-brand-500 hover:text-brand-700"
            >
              {detail}
            </a>
          ) : (
            <div className="mt-1 text-sm text-ink-500">{detail}</div>
          ))}
      </div>
    </div>
  )
}

function ExploreCard({
  to,
  eyebrow,
  title,
  text,
}: {
  to: string
  eyebrow: string
  title: string
  text: string
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-[250px] flex-col justify-between rounded-[32px] border border-sand-200 bg-[#f4f1e9] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.17em] text-brand-500">
          {eyebrow}
        </div>
        <ArrowUpRight
          size={18}
          className="text-ink-500 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-500"
        />
      </div>
      <div>
        <h3 className="text-3xl font-extrabold tracking-[-0.05em] text-brand-900">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-ink-500">{text}</p>
      </div>
    </Link>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-6">
      <div className="text-4xl font-black tracking-[-0.06em] text-brand-900">
        {value}
      </div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
        {label}
      </div>
    </div>
  )
}

function ContactCard({
  icon,
  eyebrow,
  title,
  href,
  secondary,
  secondaryHref,
  external = false,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  href: string
  secondary?: string
  secondaryHref?: string
  external?: boolean
}) {
  return (
    <div className="rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-6">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        {icon}
      </div>
      <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
        {eyebrow}
      </div>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="mt-2 block break-words text-xl font-extrabold tracking-[-0.035em] text-brand-900 transition hover:text-brand-500"
      >
        {title}
      </a>
      {secondary &&
        (secondaryHref ? (
          <a
            href={secondaryHref}
            className="mt-2 block break-words text-sm font-semibold text-ink-500 transition hover:text-brand-500"
          >
            {secondary}
          </a>
        ) : (
          <div className="mt-2 text-sm text-ink-500">{secondary}</div>
        ))}
    </div>
  )
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.2 4.2c.66 1.76 1.88 2.82 3.8 3.16v3.1a8.1 8.1 0 0 1-3.78-1.06v5.64a5.24 5.24 0 1 1-4.52-5.19v3.15a2.14 2.14 0 1 0 1.38 2V4.2h3.12Z"
        fill="currentColor"
      />
    </svg>
  )
}
