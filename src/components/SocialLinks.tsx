import { Facebook, Instagram } from 'lucide-react'

export const SOCIAL_CHANNELS = [
  {
    platform: 'facebook',
    label: 'Facebook',
    href: 'https://cs-cz.facebook.com/NFCLichnov/',
    handle: 'NFC Lichnov',
    description: 'Novinky a dění v klubu',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/nfc_lichnov_z.s?igsh=YXBjOGkyazJjencx',
    handle: '@nfc_lichnov_z.s',
    description: 'Fotky a momenty ze hřiště',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@nfc.lichnov?_r=1&_t=ZN-96ej7l3cT9K',
    handle: '@nfc.lichnov',
    description: 'Krátká videa a sestřihy',
  },
] as const

export type SocialPlatform = (typeof SOCIAL_CHANNELS)[number]['platform']

export function SocialIcon({
  platform,
  size = 24,
}: {
  platform: SocialPlatform
  size?: number
}) {
  if (platform === 'facebook') return <Facebook size={size} strokeWidth={1.8} />
  if (platform === 'instagram') return <Instagram size={size} strokeWidth={1.8} />

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.2 4.2c.66 1.76 1.88 2.82 3.8 3.16v3.1a8.1 8.1 0 0 1-3.78-1.06v5.64a5.24 5.24 0 1 1-4.52-5.19v3.15a2.14 2.14 0 1 0 1.38 2V4.2h3.12Z"
        fill="currentColor"
      />
    </svg>
  )
}
