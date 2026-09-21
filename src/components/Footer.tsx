import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-brand-900 text-white">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr] md:px-8">
        <div>
          <div className="text-2xl font-extrabold tracking-[-0.04em]">NFC Lichnov</div>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Moderní domov klubových výsledků, týmů, aktualit a života fotbalu v Lichnově.</p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Navigace</div>
          <div className="mt-4 grid gap-2 text-sm text-white/75">
            <Link to="/tymy" className="hover:text-white">Týmy</Link>
            <Link to="/zapasy" className="hover:text-white">Zápasy</Link>
            <Link to="/aktuality" className="hover:text-white">Aktuality</Link>
            <Link to="/galerie" className="hover:text-white">Galerie</Link>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Klub</div>
          <div className="mt-4 grid gap-2 text-sm text-white/75">
            <Link to="/klub" className="hover:text-white">O klubu</Link>
            <Link to="/kontakt" className="hover:text-white">Kontakt</Link>
            <Link to="/admin" className="hover:text-white">Administrace</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} NFC Lichnov</div>
    </footer>
  )
}
