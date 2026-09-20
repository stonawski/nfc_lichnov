import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminGuard } from './admin/AdminGuard'
import { AdminLayout } from './admin/AdminLayout'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { MatchesPage } from './pages/MatchesPage'
import { NewsDetailPage } from './pages/NewsDetailPage'
import { NewsPage } from './pages/NewsPage'
import { ClubPage, ContactPage } from './pages/StaticPages'
import { TeamPage } from './pages/TeamPage'
import { TeamsPage } from './pages/TeamsPage'
import { GalleryDetailPage, GalleryPage } from './pages/GalleryPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminGalleriesPage } from './pages/admin/AdminGalleriesPage'
import { AdminGalleryDetailPage } from './pages/admin/AdminGalleryDetailPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminModulePlaceholderPage } from './pages/admin/AdminModulePlaceholderPage'
import { AdminNewsEditorPage } from './pages/admin/AdminNewsEditorPage'
import { AdminNewsPage } from './pages/admin/AdminNewsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/admin/prihlaseni" element={<AdminLoginPage />} />

      <Route path="/admin" element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="galerie" element={<AdminGalleriesPage />} />
          <Route path="galerie/:id" element={<AdminGalleryDetailPage />} />
          <Route path="aktuality" element={<AdminNewsPage />} />
          <Route path="aktuality/:id" element={<AdminNewsEditorPage />} />
          <Route path="hraci" element={<AdminModulePlaceholderPage module="hraci" />} />
          <Route
            path="realizacni-tym"
            element={<AdminModulePlaceholderPage module="realizacni-tym" />}
          />
        </Route>
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tymy" element={<TeamsPage />} />
        <Route path="/tymy/:slug" element={<TeamPage />} />
        <Route path="/zapasy" element={<MatchesPage />} />
        <Route path="/aktuality" element={<NewsPage />} />
        <Route path="/aktuality/:slug" element={<NewsDetailPage />} />
        <Route path="/galerie" element={<GalleryPage />} />
        <Route path="/galerie/:slug" element={<GalleryDetailPage />} />
        <Route path="/klub" element={<ClubPage />} />
        <Route path="/kontakt" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
