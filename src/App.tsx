import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoadingState } from './components/LoadingState'
import { NetworkStatus } from './components/NetworkStatus'
import { HomePage } from './pages/HomePage'

const TeamsPage = lazy(() =>
  import('./pages/TeamsPage').then((module) => ({ default: module.TeamsPage })),
)
const TeamPage = lazy(() =>
  import('./pages/TeamPage').then((module) => ({ default: module.TeamPage })),
)
const MatchesPage = lazy(() =>
  import('./pages/MatchesPage').then((module) => ({ default: module.MatchesPage })),
)
const MatchDetailPage = lazy(() =>
  import('./pages/MatchDetailPage').then((module) => ({ default: module.MatchDetailPage })),
)
const NewsPage = lazy(() =>
  import('./pages/NewsPage').then((module) => ({ default: module.NewsPage })),
)
const NewsDetailPage = lazy(() =>
  import('./pages/NewsDetailPage').then((module) => ({ default: module.NewsDetailPage })),
)
const GalleryPage = lazy(() =>
  import('./pages/GalleryPage').then((module) => ({ default: module.GalleryPage })),
)
const GalleryDetailPage = lazy(() =>
  import('./pages/GalleryPage').then((module) => ({ default: module.GalleryDetailPage })),
)
const ClubPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.ClubPage })),
)
const HistoryPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.HistoryPage })),
)
const ArealPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.ArealPage })),
)
const ContactPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.ContactPage })),
)
const ClubStatsPage = lazy(() =>
  import('./pages/ClubStatsPage').then((module) => ({ default: module.ClubStatsPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)

const AdminGuard = lazy(() =>
  import('./admin/AdminGuard').then((module) => ({ default: module.AdminGuard })),
)
const AdminLayout = lazy(() =>
  import('./admin/AdminLayout').then((module) => ({ default: module.AdminLayout })),
)
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
const AdminClubStatsPage = lazy(() =>
  import('./pages/admin/AdminClubStatsPage').then((module) => ({
    default: module.AdminClubStatsPage,
  })),
)
const AdminGalleriesPage = lazy(() =>
  import('./pages/admin/AdminGalleriesPage').then((module) => ({
    default: module.AdminGalleriesPage,
  })),
)
const AdminGalleryDetailPage = lazy(() =>
  import('./pages/admin/AdminGalleryDetailPage').then((module) => ({
    default: module.AdminGalleryDetailPage,
  })),
)
const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((module) => ({
    default: module.AdminLoginPage,
  })),
)
const AdminNewsEditorPage = lazy(() =>
  import('./pages/admin/AdminNewsEditorPage').then((module) => ({
    default: module.AdminNewsEditorPage,
  })),
)
const AdminNewsPage = lazy(() =>
  import('./pages/admin/AdminNewsPage').then((module) => ({
    default: module.AdminNewsPage,
  })),
)
const AdminPlayerEditorPage = lazy(() =>
  import('./pages/admin/AdminPlayerEditorPage').then((module) => ({
    default: module.AdminPlayerEditorPage,
  })),
)
const AdminPlayersPage = lazy(() =>
  import('./pages/admin/AdminPlayersPage').then((module) => ({
    default: module.AdminPlayersPage,
  })),
)
const AdminStaffEditorPage = lazy(() =>
  import('./pages/admin/AdminStaffEditorPage').then((module) => ({
    default: module.AdminStaffEditorPage,
  })),
)
const AdminStaffPage = lazy(() =>
  import('./pages/admin/AdminStaffPage').then((module) => ({
    default: module.AdminStaffPage,
  })),
)

function AdminLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f2ea] px-5">
      <div role="status" aria-live="polite" className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-brand-900/15 border-t-brand-500" />
        <div className="mt-4 text-sm font-semibold text-ink-500">
          Načítám administraci…
        </div>
      </div>
    </div>
  )
}

function RouteLoading() {
  return (
    <main className="min-h-[65svh] bg-sand-50 px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <LoadingState rows={5} />
      </div>
    </main>
  )
}

function PublicLazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>
}

export default function App() {
  return (
    <>
      <NetworkStatus />
      <Routes>
        <Route
          path="/admin/prihlaseni"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminLoginPage />
            </Suspense>
          }
        />

        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminGuard />
            </Suspense>
          }
        >
          <Route
            element={
              <Suspense fallback={<AdminLoading />}>
                <AdminLayout />
              </Suspense>
            }
          >
            <Route index element={<Suspense fallback={<AdminLoading />}><AdminDashboardPage /></Suspense>} />
            <Route path="galerie" element={<Suspense fallback={<AdminLoading />}><AdminGalleriesPage /></Suspense>} />
            <Route path="galerie/:id" element={<Suspense fallback={<AdminLoading />}><AdminGalleryDetailPage /></Suspense>} />
            <Route path="aktuality" element={<Suspense fallback={<AdminLoading />}><AdminNewsPage /></Suspense>} />
            <Route path="aktuality/:id" element={<Suspense fallback={<AdminLoading />}><AdminNewsEditorPage /></Suspense>} />
            <Route path="hraci" element={<Suspense fallback={<AdminLoading />}><AdminPlayersPage /></Suspense>} />
            <Route path="hraci/:id" element={<Suspense fallback={<AdminLoading />}><AdminPlayerEditorPage /></Suspense>} />
            <Route path="realizacni-tym" element={<Suspense fallback={<AdminLoading />}><AdminStaffPage /></Suspense>} />
            <Route path="realizacni-tym/:id" element={<Suspense fallback={<AdminLoading />}><AdminStaffEditorPage /></Suspense>} />
            <Route path="statistiky" element={<Suspense fallback={<AdminLoading />}><AdminClubStatsPage /></Suspense>} />
          </Route>
        </Route>

        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tymy" element={<PublicLazy><TeamsPage /></PublicLazy>} />
          <Route path="/tymy/:slug" element={<PublicLazy><TeamPage /></PublicLazy>} />
          <Route path="/zapasy" element={<PublicLazy><MatchesPage /></PublicLazy>} />
          <Route path="/zapasy/:id" element={<PublicLazy><MatchDetailPage /></PublicLazy>} />
          <Route path="/aktuality" element={<PublicLazy><NewsPage /></PublicLazy>} />
          <Route path="/aktuality/:slug" element={<PublicLazy><NewsDetailPage /></PublicLazy>} />
          <Route path="/galerie" element={<PublicLazy><GalleryPage /></PublicLazy>} />
          <Route path="/galerie/:slug" element={<PublicLazy><GalleryDetailPage /></PublicLazy>} />
          <Route path="/klub" element={<PublicLazy><ClubPage /></PublicLazy>} />
          <Route path="/klub/historie" element={<PublicLazy><HistoryPage /></PublicLazy>} />
          <Route path="/klub/statistiky" element={<PublicLazy><ClubStatsPage /></PublicLazy>} />
          <Route path="/klub/areal" element={<PublicLazy><ArealPage /></PublicLazy>} />
          <Route path="/kontakt" element={<PublicLazy><ContactPage /></PublicLazy>} />
          <Route path="*" element={<PublicLazy><NotFoundPage /></PublicLazy>} />
        </Route>
      </Routes>
    </>
  )
}
