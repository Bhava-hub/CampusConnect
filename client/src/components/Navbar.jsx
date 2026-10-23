import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,15,30,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: '1.3rem',
            background: 'linear-gradient(135deg, #14b8a6, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            CampusConnect
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/topics" style={linkStyle}>🧠 Explain It</Link>
          <Link to="/activities" style={linkStyle}>👥 One More Person</Link>
          {user?.role === 'admin' && (
            <Link to="/admin/users" style={{ ...linkStyle, color: '#c4b5fd', fontWeight: 600 }}>
              🛡️ Manage Users
            </Link>
          )}
        </div>

        {/* Auth actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                👋 {user.name}
                {user.reputation_pts > 0 && (
                  <span style={{ marginLeft: '0.4rem', color: '#14b8a6', fontWeight: 600 }}>
                    ★ {user.reputation_pts}
                  </span>
                )}
              </span>
              <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const linkStyle = {
  color: '#94a3b8',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 500,
  transition: 'color 0.2s',
  padding: '0.25rem 0',
};
