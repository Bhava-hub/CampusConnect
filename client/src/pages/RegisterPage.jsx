import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { PixelIcon } from '../components/Pixel';
import AvatarPicker from '../components/AvatarPicker';
import logoImg from '../assets/logo.jpg';
import campusBg from '../assets/campus-bg.jpg';

const EDU_DOMAINS = ['.edu', '.ac.in', '.edu.in', 'university', 'college', 'inst.ac', 'iit.', 'nit.', 'iiit.'];

function isEducationEmail(email) {
  const lower = (email || '').toLowerCase();
  return EDU_DOMAINS.some(d => lower.includes(d));
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', avatar: 'doge' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Education email checkpoint
    if (!isEducationEmail(form.email)) {
      setError('Checkpoint: CampusConnect requires an official student/university email (e.g. .edu, .ac.in, .edu.in)');
      return;
    }

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

  const emailEntered = form.email.trim();
  const isEmailValid = emailEntered ? isEducationEmail(emailEntered) : null;

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
        maxWidth: '460px',
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

        <h1 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.35rem' }}>Create Account</h1>
        <p style={{ color: 'var(--muted-fg)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Join the campus quest — connect with classmates and find teammates.
        </p>

        {/* Education checkpoint info banner */}
        <div style={{
          background: 'var(--mint-soft)',
          border: '2px solid var(--navy)',
          padding: '0.65rem 0.85rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          fontSize: '0.8rem',
        }}>
          <PixelIcon name="check" size={16} />
          <div>
            <strong>Education Checkpoint:</strong> Only official college/university email addresses (.edu, .ac.in, etc.) are allowed.
          </div>
        </div>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <AvatarPicker
            selected={form.avatar}
            onSelect={(id) => setForm((prev) => ({ ...prev, avatar: id }))}
          />

          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="e.g. Aanya Rao"
              value={form.name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>University Email *</label>
              {emailEntered && (
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: "'Silkscreen', monospace",
                  color: isEmailValid ? 'var(--navy)' : 'var(--destructive)',
                  fontWeight: 600,
                }}>
                  {isEmailValid ? '✓ Verified .edu/.ac.in' : '✗ Need university domain'}
                </span>
              )}
            </div>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="you@campus.edu or rollno@college.ac.in"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                ...inputStyle,
                borderColor: emailEntered ? (isEmailValid ? 'var(--navy)' : 'var(--destructive)') : 'var(--navy)',
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Department / Major <span style={{ color: 'var(--muted-fg)', fontWeight: 400 }}>(optional)</span></label>
            <input
              id="reg-department"
              name="department"
              type="text"
              placeholder="e.g. Computer Science & Engineering"
              value={form.department}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password *</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button
            id="reg-submit"
            type="submit"
            className="pixel-btn pixel-btn-orange"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.8rem' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{
          borderTop: '2px dashed rgba(26, 38, 57, 0.2)',
          margin: '1.75rem 0 1.25rem',
        }} />

        <p style={{ textAlign: 'center', color: 'var(--muted-fg)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
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
  marginBottom: '0.35rem',
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
