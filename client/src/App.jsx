import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage           from './pages/HomePage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import TopicsPage         from './pages/TopicsPage';
import TopicDetailPage    from './pages/TopicDetailPage';
import CreateTopicPage    from './pages/CreateTopicPage';
import ActivitiesPage     from './pages/ActivitiesPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import CreateActivityPage from './pages/CreateActivityPage';
import AdminUsersPage     from './pages/AdminUsersPage';
import ProfilePage        from './pages/ProfilePage';
import MyActivityPage     from './pages/MyActivityPage';
import SavedPage          from './pages/SavedPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public routes */}
              <Route path="/"            element={<HomePage />} />
              <Route path="/login"       element={<LoginPage />} />
              <Route path="/register"    element={<RegisterPage />} />
              <Route path="/topics"      element={<TopicsPage />} />
              <Route path="/topics/:id"  element={<TopicDetailPage />} />
              <Route path="/activities"      element={<ActivitiesPage />} />
              <Route path="/activities/:id"  element={<ActivityDetailPage />} />

              {/* Protected routes */}
              <Route path="/create-topic"    element={<ProtectedRoute><CreateTopicPage /></ProtectedRoute>} />
              <Route path="/create-activity" element={<ProtectedRoute><CreateActivityPage /></ProtectedRoute>} />
              <Route path="/admin/users"     element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/my-activity"     element={<ProtectedRoute><MyActivityPage /></ProtectedRoute>} />
              <Route path="/saved"           element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
            </Routes>
          </main>

          <footer style={{
            borderTop: '2px solid var(--navy)',
            padding: '1.25rem 1.5rem',
            textAlign: 'center',
            color: 'var(--muted-fg)',
            fontSize: '0.8rem',
            fontFamily: "'Silkscreen', monospace",
            letterSpacing: '0.05em',
            background: 'var(--cream)',
          }}>
            CAMPUSCONNECT · A LIGHTWEIGHT SOCIAL LAYER FOR CAMPUS LIFE
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
