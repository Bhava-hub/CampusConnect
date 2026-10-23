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
import AdminUsersPage    from './pages/AdminUsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/"           element={<HomePage />} />
              <Route path="/login"      element={<LoginPage />} />
              <Route path="/register"   element={<RegisterPage />} />
              <Route path="/topics"     element={<TopicsPage />} />
              <Route path="/topics/:id" element={<TopicDetailPage />} />
              <Route path="/activities"     element={<ActivitiesPage />} />
              <Route path="/activities/:id" element={<ActivityDetailPage />} />

              {/* Protected routes */}
              <Route path="/create-topic"    element={<ProtectedRoute><CreateTopicPage /></ProtectedRoute>} />
              <Route path="/create-activity" element={<ProtectedRoute><CreateActivityPage /></ProtectedRoute>} />
              <Route path="/admin/users"     element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
            </Routes>
          </main>

          {/* Footer */}
          <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            padding: '1.5rem',
            textAlign: 'center',
            color: '#475569',
            fontSize: '0.8rem',
          }}>
            CampusConnect · A lightweight social layer for campus life
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
