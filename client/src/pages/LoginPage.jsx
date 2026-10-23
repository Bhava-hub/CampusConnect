import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

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
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass animate-fadeIn" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Welcome back 👋</h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Sign in to your CampusConnect account
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input id="login-email" name="email" type="email" className="input"
              placeholder="you@university.edu" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input id="login-password" name="password" type="password" className="input"
              placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary" disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#14b8a6', fontWeight: 600, textDecoration: 'none' }}>
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' };
