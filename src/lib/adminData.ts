import { supabase } from './supabase'
import type { Gallery, GalleryImage, NewsArticle } from './types'

export type CreateGalleryInput = {
  title: string
  slug: string
  description?: string
  event_date?: string
}

const gallerySelect =
  'id,team_id,title,slug,description,cover_image,event_date,published,published_at,sort_order,created_at,updated_at'

export async function fetchAdminGalleries(): Promise<Gallery[]> {
  const { data, error } = await supabase
    .from('galleries')
    .select(gallerySelect)
    .order('sort_order', { ascending: true })
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Gallery[]
}

export async function createGallery(input: CreateGalleryInput): Promise<Gallery> {
  const { data, error } = await supabase
    .from('galleries')
    .insert({
      title: input.title.trim(),
      slug: input.slug.trim(),
      description: input.description?.trim() || null,
      event_date: input.event_date || null,
      published: false,
      sort_order: 0,
    })
    .select(gallerySelect)
    .single()

  if (error) throw error
  return data as Gallery
}

export async function setGalleryPublished(id: string, published: boolean): Promise<Gallery> {
  const { data, error } = await supabase
    .from('galleries')
    .update({
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select(gallerySelect)
    .single()

  if (error) throw error
  return data as Gallery
}

export async function fetchAdminGalleryImageCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('gallery_images').select('gallery_id')
  if (error) throw error

  return (data ?? []).reduce<Record<string, number>>((counts, row) => {
    const galleryId = row.gallery_id as string
    counts[galleryId] = (counts[galleryId] ?? 0) + 1
    return counts
  }, {})
}


export async function fetchAdminGalleryById(id: string): Promise<Gallery | null> {
  const { data, error } = await supabase
    .from('galleries')
    .select(gallerySelect)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Gallery | null
}

export async function fetchAdminGalleryImages(galleryId: string): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('id,gallery_id,image_url,caption,sort_order,created_at,updated_at')
    .eq('gallery_id', galleryId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as GalleryImage[]
}

export async function addGalleryImage(
  galleryId: string,
  imageUrl: string,
): Promise<GalleryImage> {
  const { data: latest, error: latestError } = await supabase
    .from('gallery_images')
    .select('sort_order')
    .eq('gallery_id', galleryId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) throw latestError

  const nextOrder = typeof latest?.sort_order === 'number' ? latest.sort_order + 1 : 0

  const { data, error } = await supabase
    .from('gallery_images')
    .insert({
      gallery_id: galleryId,
      image_url: imageUrl,
      caption: null,
      sort_order: nextOrder,
    })
    .select('id,gallery_id,image_url,caption,sort_order,created_at,updated_at')
    .single()

  if (error) throw error
  return data as GalleryImage
}

export async function setGalleryCover(id: string, coverImage: string): Promise<Gallery> {
  const { data, error } = await supabase
    .from('galleries')
    .update({ cover_image: coverImage })
    .eq('id', id)
    .select(gallerySelect)
    .single()

  if (error) throw error
  return data as Gallery
}


export async function deleteGalleryImage(id: string): Promise<void> {
  const { error } = await supabase.from('gallery_images').delete().eq('id', id)
  if (error) throw error
}

export async function clearGalleryCover(id: string): Promise<void> {
  const { error } = await supabase
    .from('galleries')
    .update({ cover_image: null })
    .eq('id', id)

  if (error) throw error
}

export async function deleteGalleryRecords(id: string): Promise<void> {
  const { error: imagesError } = await supabase
    .from('gallery_images')
    .delete()
    .eq('gallery_id', id)

  if (imagesError) throw imagesError

  const { error: galleryError } = await supabase.from('galleries').delete().eq('id', id)
  if (galleryError) throw galleryError
}


const newsSelect =
  'id,team_id,title,slug,excerpt,content,cover_image,category,featured,published,published_at,created_at'

export type CreateNewsInput = {
  title: string
  slug: string
}

export type UpdateNewsInput = {
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string | null
  team_id: string | null
  featured: boolean
}

export async function fetchAdminNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news')
    .select(newsSelect)
    .order('published', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as NewsArticle[]
}

export async function fetchAdminNewsById(id: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from('news')
    .select(newsSelect)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as NewsArticle | null
}

export async function createNewsDraft(input: CreateNewsInput): Promise<NewsArticle> {
  const { data, error } = await supabase
    .from('news')
    .insert({
      title: input.title.trim(),
      slug: input.slug.trim(),
      excerpt: null,
      content: null,
      cover_image: null,
      category: null,
      team_id: null,
      featured: false,
      published: false,
      published_at: null,
    })
    .select(newsSelect)
    .single()

  if (error) throw error
  return data as NewsArticle
}

export async function updateNewsArticle(
  id: string,
  input: UpdateNewsInput,
): Promise<NewsArticle> {
  const { data, error } = await supabase
    .from('news')
    .update({
      title: input.title.trim(),
      slug: input.slug.trim(),
      excerpt: input.excerpt?.trim() || null,
      content: input.content?.trim() || null,
      cover_image: input.cover_image || null,
      category: input.category?.trim() || null,
      team_id: input.team_id || null,
      featured: input.featured,
    })
    .eq('id', id)
    .select(newsSelect)
    .single()

  if (error) throw error
  return data as NewsArticle
}

export async function setNewsPublished(
  id: string,
  published: boolean,
): Promise<NewsArticle> {
  const { data, error } = await supabase
    .from('news')
    .update({
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select(newsSelect)
    .single()

  if (error) throw error
  return data as NewsArticle
}

export async function setNewsCover(
  id: string,
  coverImage: string | null,
): Promise<NewsArticle> {
  const { data, error } = await supabase
    .from('news')
    .update({ cover_image: coverImage })
    .eq('id', id)
    .select(newsSelect)
    .single()

  if (error) throw error
  return data as NewsArticle
}

export async function deleteNewsArticle(id: string): Promise<void> {
  const { error } = await supabase.from('news').delete().eq('id', id)
  if (error) throw error
}
