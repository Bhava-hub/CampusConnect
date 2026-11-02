import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { PixelIcon } from '../components/Pixel';
import logoImg from '../assets/logo.jpg';
import campusBg from '../assets/campus-bg.jpg';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      backgroundImage: `linear-gradient(rgba(26, 38, 57, 0.45), rgba(26, 38, 57, 0.65)), url(${campusBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div className="pixel-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(4px)',
        position: 'relative',
        zIndex: 1,
      }}>
        <img
          src={logoImg}
          alt="CampusConnect Logo"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--navy)',
            margin: '0 auto 1.25rem',
            display: 'block',
            boxShadow: 'var(--shadow-pixel-sm)',
            backgroundColor: '#f7f6f0',
          }}
        />

        <h1 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.35rem' }}>Welcome Back</h1>
        <p style={{ color: 'var(--muted-fg)', textAlign: 'center', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
          Log in to continue your campus quest.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '2px solid var(--destructive)',
            padding: '0.75rem 1rem',
            color: 'var(--destructive)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>University Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="pixel-btn pixel-btn-orange"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.8rem' }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div style={{
          borderTop: '2px dashed rgba(26, 38, 57, 0.2)',
          margin: '1.75rem 0 1.25rem',
        }} />

        <p style={{ textAlign: 'center', color: 'var(--muted-fg)', fontSize: '0.875rem' }}>
          New to CampusConnect?{' '}
          <Link to="/register" style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontFamily: "'Pixelify Sans', monospace",
  fontWeight: 600,
  fontSize: '0.9rem',
  marginBottom: '0.4rem',
  color: 'var(--navy)',
};

const inputStyle = {
  width: '100%',
  padding: '0.7rem 0.9rem',
  border: '2px solid var(--navy)',
  fontFamily: "'Rubik', sans-serif",
  fontSize: '0.95rem',
  background: 'var(--card)',
  color: 'var(--navy)',
  outline: 'none',
  boxSizing: 'border-box',
};
