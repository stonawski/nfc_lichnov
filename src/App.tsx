import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ClubStatsPage } from './pages/ClubStatsPage'
import { GalleryDetailPage, GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'
import { MatchDetailPage } from './pages/MatchDetailPage'
import { MatchesPage } from './pages/MatchesPage'
import { NewsDetailPage } from './pages/NewsDetailPage'
import { NewsPage } from './pages/NewsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ArealPage, ClubPage, ContactPage, HistoryPage } from './pages/StaticPages'
import { TeamPage } from './pages/TeamPage'
import { TeamsPage } from './pages/TeamsPage'

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

export default function App() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Routes>
        <Route path="/admin/prihlaseni" element={<AdminLoginPage />} />

        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="galerie" element={<AdminGalleriesPage />} />
            <Route path="galerie/:id" element={<AdminGalleryDetailPage />} />
            <Route path="aktuality" element={<AdminNewsPage />} />
            <Route path="aktuality/:id" element={<AdminNewsEditorPage />} />
            <Route path="hraci" element={<AdminPlayersPage />} />
            <Route path="hraci/:id" element={<AdminPlayerEditorPage />} />
            <Route path="realizacni-tym" element={<AdminStaffPage />} />
            <Route path="realizacni-tym/:id" element={<AdminStaffEditorPage />} />
            <Route path="statistiky" element={<AdminClubStatsPage />} />
          </Route>
        </Route>

        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tymy" element={<TeamsPage />} />
          <Route path="/tymy/:slug" element={<TeamPage />} />
          <Route path="/zapasy" element={<MatchesPage />} />
          <Route path="/zapasy/:id" element={<MatchDetailPage />} />
          <Route path="/aktuality" element={<NewsPage />} />
          <Route path="/aktuality/:slug" element={<NewsDetailPage />} />
          <Route path="/galerie" element={<GalleryPage />} />
          <Route path="/galerie/:slug" element={<GalleryDetailPage />} />
          <Route path="/klub" element={<ClubPage />} />
          <Route path="/klub/historie" element={<HistoryPage />} />
          <Route path="/klub/statistiky" element={<ClubStatsPage />} />
          <Route path="/klub/areal" element={<ArealPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
