import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{
          width: 40, height: 40, border: '3px solid rgba(13,148,136,0.2)',
          borderTop: '3px solid #14b8a6', borderRadius: '50%',
        }} />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
