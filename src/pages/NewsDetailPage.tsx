import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { fetchNewsBySlug } from '../lib/data'
import { formatDate } from '../lib/format'

export function NewsDetailPage(){const{slug=''}=useParams();const q=useQuery({queryKey:['news',slug],queryFn:()=>fetchNewsBySlug(slug),retry:false});if(q.isLoading)return <Wrap><LoadingState rows={4}/></Wrap>;if(!q.data)return <Wrap><EmptyState title="Článek nebyl nalezen" text="Je možné, že už není publikovaný."/></Wrap>;const a=q.data;return <main><section className="px-5 py-16 md:px-8 md:py-24"><article className="mx-auto max-w-[880px]"><div className="text-xs font-bold uppercase tracking-[.18em] text-brand-500">{a.category||'Aktualita'} · {formatDate(a.published_at)}</div><h1 className="mt-4 text-5xl font-black leading-[.98] tracking-[-.06em] text-brand-900 sm:text-6xl">{a.title}</h1>{a.excerpt&&<p className="mt-6 text-xl leading-8 text-ink-500">{a.excerpt}</p>}{a.cover_image&&<img src={a.cover_image} alt="" className="mt-10 aspect-[16/9] w-full rounded-5xl object-cover"/>}<div className="prose-club mt-10 whitespace-pre-wrap text-base leading-8 text-ink-900">{a.content||'Obsah článku zatím není doplněn.'}</div></article></section></main>}
function Wrap({children}:{children:ReactNode}){return <main className="px-5 py-20 md:px-8"><div className="mx-auto max-w-[900px]">{children}</div></main>}
