import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass animate-fadeIn" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Create account 🎓</h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Join CampusConnect and start collaborating
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input id="reg-name" name="name" className="input"
              placeholder="Jane Doe" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input id="reg-email" name="email" type="email" className="input"
              placeholder="you@university.edu" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label style={labelStyle}>Department <span style={{ color: '#64748b' }}>(optional)</span></label>
            <input id="reg-department" name="department" className="input"
              placeholder="e.g. Computer Science" value={form.department} onChange={handleChange} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input id="reg-password" name="password" type="password" className="input"
              placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
          </div>
          <button id="reg-submit" type="submit" className="btn btn-primary" disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#14b8a6', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' };
