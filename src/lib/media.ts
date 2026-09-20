import { supabase } from './supabase'

export type MediaScope = 'gallery' | 'player' | 'news' | 'staff' | 'club'

export function mediaObjectKeyFromUrl(url: string): string {
  const parsed = new URL(url)
  return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''))
}

export async function deleteMediaObjects({
  scope,
  resourceId,
  objectKeys,
}: {
  scope: MediaScope
  resourceId: string
  objectKeys: string[]
}) {
  const uniqueKeys = [...new Set(objectKeys.filter(Boolean))]
  if (!uniqueKeys.length) return

  const { data, error } = await supabase.functions.invoke('media-delete', {
    body: {
      scope,
      resourceId,
      objectKeys: uniqueKeys,
    },
  })

  if (error) throw error
  if (!data?.ok) {
    throw new Error(data?.error || 'Soubory se nepodařilo smazat z R2.')
  }
}
