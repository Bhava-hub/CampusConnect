import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PixelIcon } from './Pixel';
import { AvatarDisplay } from './AvatarPicker';
import logoImg from '../assets/logo.jpg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/topics', label: 'Ask & Answer', icon: 'question' },
    { to: '/activities', label: 'Find Teammates', icon: 'team' },
    ...(user ? [
      { to: '/my-activity', label: 'My Activity', icon: 'activity' },
      { to: '/saved', label: 'Saved', icon: 'bookmark' },
      { to: '/profile', label: 'Profile', icon: 'user' },
    ] : []),
    ...(user?.role === 'admin' ? [
      { to: '/admin/users', label: 'Admin', icon: 'star' },
    ] : []),
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '2px solid var(--navy)',
      backgroundColor: 'rgba(247, 246, 240, 0.96)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: 'var(--navy)' }}>
          <img
            src={logoImg}
            alt="Campus Connect Logo"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--navy)',
              boxShadow: 'var(--shadow-pixel-sm)',
              display: 'block',
              backgroundColor: '#f7f6f0',
            }}
          />
          <span style={{
            fontFamily: "'Pixelify Sans', monospace",
            fontSize: '1.25rem',
            fontWeight: 700,
            lineHeight: 1.05,
            color: 'var(--navy)',
          }}>
            Campus<br /><span style={{ color: 'var(--orange)' }}>Connect</span>
          </span>
        </Link>

        {/* Navigation items */}
        <nav aria-label="Main" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          overflowX: 'auto',
          maxWidth: '100%',
          paddingBottom: '0.1rem',
        }}>
          {navLinks.map((item) => {
            const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  fontFamily: "'Pixelify Sans', monospace",
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: active ? 'var(--cream)' : 'var(--navy)',
                  background: active ? 'var(--navy)' : 'transparent',
                  border: '2px solid',
                  borderColor: active ? 'var(--navy)' : 'transparent',
                  borderRadius: 2,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <PixelIcon name={item.icon} size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User / Auth section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--navy)' }}>
                <AvatarDisplay avatarId={user.avatar || 'doge'} size={34} />
                <div style={{ display: 'none', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '0.9rem', fontWeight: 600 }}>
                    {user.name}
                  </span>
                  {user.reputation_pts > 0 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--orange)', fontWeight: 600 }}>
                      ★ {user.reputation_pts} pts
                    </span>
                  )}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="pixel-btn"
                id="logout-btn"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  background: 'var(--card)',
                  color: 'var(--navy)',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="pixel-btn pixel-btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                Login
              </Link>
              <Link to="/register" className="pixel-btn pixel-btn-orange" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
