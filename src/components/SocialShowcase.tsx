import { ArrowUpRight } from 'lucide-react'
import { SOCIAL_CHANNELS, SocialIcon } from './SocialLinks'

const visual = {
  facebook: {
    glow: 'bg-[linear-gradient(135deg,#1877f2_0%,#365fca_60%,#174890_100%)]',
    icon: 'text-[#1877f2] group-hover:text-white',
    accent: 'text-[#3470cb]',
  },
  instagram: {
    glow: 'bg-[linear-gradient(135deg,#f4a145_0%,#e44483_46%,#8c47c5_100%)]',
    icon: 'text-[#c84788] group-hover:text-white',
    accent: 'text-[#bb4e87]',
  },
  tiktok: {
    glow: 'bg-[linear-gradient(135deg,#153e3f_0%,#161d2a_55%,#883f69_100%)]',
    icon: 'text-[#234c45] group-hover:text-white',
    accent: 'text-[#42746a]',
  },
} as const

export function SocialShowcase() {
  return (
    <section aria-labelledby="socials-title" className="relative overflow-hidden bg-white px-5 pb-16 pt-20 md:px-8 md:pb-20 md:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(0,146,63,.045),transparent_47%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="mb-9 flex flex-col gap-3 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-500">NFC online</div>
            <h2 id="socials-title" className="mt-3 text-4xl font-black leading-tight tracking-[-0.055em] text-brand-900 sm:text-5xl">
              Navštivte nás na
              <span className="block text-brand-500">sociálních sítích.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-ink-500 sm:text-base">
            Fotbal žije i mimo hřiště. Sledujte naše novinky, fotografie a videa z klubového dění.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {SOCIAL_CHANNELS.map((social) => {
            const style = visual[social.platform]
            return (
              <a
                key={social.platform}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Navštívit NFC Lichnov na ${social.label} (otevře nové okno)`}
                className="group relative isolate flex min-h-[204px] flex-col justify-between overflow-hidden rounded-[26px] border border-sand-200 bg-[#fbfaf6] p-6 text-brand-900 shadow-[0_9px_24px_rgba(24,53,42,.04)] transition-[transform,box-shadow,border-color] duration-300 ease-smooth hover:-translate-y-1 hover:border-transparent hover:shadow-[0_24px_42px_rgba(24,53,42,.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 sm:p-7 motion-reduce:transform-none"
              >
                <div className={`pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-smooth group-hover:opacity-100 group-focus-visible:opacity-100 ${style.glow}`} aria-hidden="true" />
                <div className="flex items-start justify-between gap-3">
                  <div className={`grid h-14 w-14 place-items-center rounded-[18px] bg-white shadow-[0_8px_18px_rgba(24,53,42,.08)] transition-colors duration-300 group-hover:bg-white/15 group-focus-visible:bg-white/15 ${style.icon}`}>
                    <SocialIcon platform={social.platform} size={29} />
                  </div>
                  <ArrowUpRight size={22} className="text-brand-900/40 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white group-focus-visible:text-white" />
                </div>

                <div className="mt-7">
                  <div className="text-xl font-black tracking-[-0.04em] transition-colors group-hover:text-white group-focus-visible:text-white">{social.label}</div>
                  <div className="mt-1 text-sm font-semibold text-ink-500 transition-colors group-hover:text-white/85 group-focus-visible:text-white/85">{social.handle}</div>
                  <p className="mt-3 text-xs font-medium text-ink-500/80 transition-colors group-hover:text-white/75 group-focus-visible:text-white/75">{social.description}</p>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
