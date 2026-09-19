import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { TeamsPage } from './pages/TeamsPage'
import { TeamPage } from './pages/TeamPage'
import { MatchesPage } from './pages/MatchesPage'
import { NewsPage } from './pages/NewsPage'
import { NewsDetailPage } from './pages/NewsDetailPage'
import { AdminPlaceholderPage, ClubPage, ContactPage, GalleryDetailPage, GalleryPage } from './pages/StaticPages'

export default function App() {
  return (
    <Routes>
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
        <Route path="/admin" element={<AdminPlaceholderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
