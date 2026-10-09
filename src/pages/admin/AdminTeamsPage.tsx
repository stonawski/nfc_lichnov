import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Image as ImageIcon, Images, Trash2, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MediaUploader } from '../../admin/MediaUploader'
import { setTeamHeroImage } from '../../lib/adminData'
import { fetchGalleries, fetchTeams } from '../../lib/data'
import { deleteMediaObjects, mediaObjectKeyFromUrl } from '../../lib/media'
import type { Team } from '../../lib/types'

export function AdminTeamsPage() {
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })
  const galleriesQuery = useQuery({
    queryKey: ['galleries', 'admin-team-presentation'],
    queryFn: fetchGalleries,
    retry: false,
  })

  if (teamsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-sand-100" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-[30px] bg-sand-100" />
          <div className="h-96 animate-pulse rounded-[30px] bg-sand-100" />
        </div>
      </div>
    )
  }

  if (teamsQuery.isError) {
    return (
      <div className="mx-auto max-w-[900px] rounded-[30px] border border-red-200 bg-red-50 p-7 text-red-700">
        Týmy se nepodařilo načíst.
      </div>
    )
  }

  const teams = teamsQuery.data ?? []
  const galleries = galleriesQuery.data ?? []

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          Týmová prezentace
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
          Týmy
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-500">
          Spravuj hlavní týmové fotografie pro veřejné hero sekce. Když vlastní
          fotografie chybí, web automaticky použije titulní fotografii poslední
          publikované galerie přiřazené k danému týmu.
        </p>
      </div>

      <div className="mt-9 grid gap-5 md:grid-cols-2">
        {teams.map((team) => (
          <TeamMediaCard
            key={team.id}
            team={team}
            galleryCover={
              galleries.find((gallery) => gallery.team_id === team.id)?.cover_image ?? null
            }
            gallerySlug={
              galleries.find((gallery) => gallery.team_id === team.id)?.slug ?? null
            }
          />
        ))}
      </div>
    </div>
  )
}

function TeamMediaCard({
  team,
  galleryCover,
  gallerySlug,
}: {
  team: Team
  galleryCover: string | null
  gallerySlug: string | null
}) {
  const queryClient = useQueryClient()
  const effectiveImage = team.hero_image_url || galleryCover
  const resourceId = `team-${team.id}`

  async function handleUploaded({
    publicUrl,
    objectKey,
  }: {
    publicUrl: string
    objectKey: string
  }) {
    const previous = team.hero_image_url

    try {
      await setTeamHeroImage(team.id, publicUrl)
    } catch (error) {
      try {
        await deleteMediaObjects({
          scope: 'club',
          resourceId,
          objectKeys: [objectKey],
        })
      } catch {
        // The database error is more useful to surface than cleanup failure.
      }
      throw error
    }

    if (previous) {
      const previousKey = mediaObjectKeyFromUrl(previous)
      if (previousKey.startsWith(`club/${resourceId}/`)) {
        try {
          await deleteMediaObjects({
            scope: 'club',
            resourceId,
            objectKeys: [previousKey],
          })
        } catch (error) {
          console.warn('Old team image could not be removed from R2', error)
        }
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['teams'] })
  }

  async function removeImage() {
    const previous = team.hero_image_url
    await setTeamHeroImage(team.id, null)

    if (previous) {
      const previousKey = mediaObjectKeyFromUrl(previous)
      if (previousKey.startsWith(`club/${resourceId}/`)) {
        try {
          await deleteMediaObjects({
            scope: 'club',
            resourceId,
            objectKeys: [previousKey],
          })
        } catch (error) {
          console.warn('Team image could not be removed from R2', error)
        }
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['teams'] })
  }

  const removeMutation = useMutation({
    mutationFn: removeImage,
  })

  return (
    <article className="overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6]">
      <div className="relative aspect-[16/9] overflow-hidden bg-sand-100">
        {effectiveImage ? (
          <img
            src={effectiveImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-center text-ink-500">
            <div>
              <UsersRound size={34} className="mx-auto text-brand-700/45" />
              <div className="mt-3 text-xs font-semibold">Bez týmové fotografie</div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/55">
            {team.category || 'NFC Lichnov'}
          </div>
          <div className="mt-1 text-2xl font-black tracking-[-0.045em]">{team.name}</div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-700">
            {team.hero_image_url
              ? 'Vlastní foto'
              : galleryCover
                ? 'Fallback z galerie'
                : 'Bez fotografie'}
          </span>
          {team.season && (
            <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-500">
              {team.season}
            </span>
          )}
        </div>

        {gallerySlug && (
          <Link
            to={`/galerie?album=${encodeURIComponent(gallerySlug)}`}
            target="_blank"
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-brand-900 hover:text-brand-500"
          >
            <Images size={14} />
            Otevřít přiřazenou galerii
          </Link>
        )}

        <div className="mt-5">
          <MediaUploader
            scope="club"
            resourceId={resourceId}
            multiple={false}
            onUploaded={handleUploaded}
          />
        </div>

        {team.hero_image_url && (
          <button
            type="button"
            disabled={removeMutation.isPending}
            onClick={() => {
              if (window.confirm('Opravdu chceš odstranit vlastní týmovou fotografii?')) {
                removeMutation.mutate()
              }
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={14} />
            Odstranit vlastní fotografii
          </button>
        )}

        {removeMutation.isError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700">
            Fotografii se nepodařilo uložit. Ověř, že je aplikovaná migrace
            team_hero_image.
          </div>
        )}

        {!team.hero_image_url && !galleryCover && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white px-3.5 py-3 text-xs leading-5 text-ink-500 ring-1 ring-sand-200">
            <ImageIcon size={14} className="mt-0.5 shrink-0 text-brand-500" />
            Po nahrání se fotografie automaticky zobrazí v hero sekci veřejné
            stránky tohoto týmu.
          </div>
        )}
      </div>
    </article>
  )
}
