import { useLocation } from 'react-router-dom'
import { Seo } from './Seo'

const routes: Record<string, { title?: string; description: string }> = {
  '/': {
    description:
      'Oficiální web NFC Lichnov — výsledky, zápasy, týmy, aktuality, galerie a život klubu.',
  },
  '/tymy': {
    title: 'Týmy',
    description:
      'Přehled týmů NFC Lichnov od mužů po mládež včetně zápasů, hráčů a tabulek.',
  },
  '/zapasy': {
    title: 'Zápasy',
    description:
      'Program a výsledky zápasů NFC Lichnov napříč klubovými kategoriemi.',
  },
  '/aktuality': {
    title: 'Aktuality',
    description:
      'Novinky, zápasy, turnaje a dění v NFC Lichnov na jednom místě.',
  },
  '/galerie': {
    title: 'Galerie',
    description:
      'Fotografie ze zápasů, turnajů, tréninků a života fotbalového klubu NFC Lichnov.',
  },
  '/klub': {
    title: 'O klubu',
    description:
      'Informace o NFC Lichnov, fotbalovém klubu z Lichnova a jeho fungování.',
  },
  '/klub/historie': {
    title: 'Historie klubu',
    description:
      'Historie fotbalu v Lichnově a vývoj NFC Lichnov od založení klubu.',
  },
  '/klub/statistiky': {
    title: 'Historické statistiky',
    description:
      'Historické zápasy, střelci, klubové rekordy a archiv sezon NFC Lichnov.',
  },
  '/klub/areal': {
    title: 'Sportovní areál',
    description:
      'Sportovní areál NFC Lichnov, informace o hřišti, zázemí a návštěvě klubu.',
  },
  '/kontakt': {
    title: 'Kontakt',
    description:
      'Kontaktní informace a spojení na fotbalový klub NFC Lichnov.',
  },
}

export function PublicRouteSeo() {
  const location = useLocation()
  const config = routes[location.pathname]

  if (!config) return null

  return (
    <Seo
      title={config.title}
      description={config.description}
      canonicalPath={location.pathname}
    />
  )
}
