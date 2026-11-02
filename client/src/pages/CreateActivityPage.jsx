import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActivity } from '../api/api';
import { PixelIcon } from '../components/Pixel';

const CATEGORIES = ['Hackathon', 'Research', 'Competition', 'Course Project', 'Sports', 'Creative', 'General'];
const SUGGESTED_SKILLS = [
  'React', 'Python', 'ML/AI', 'Figma', 'Node.js', 'Java', 'C++',
  'Flutter', 'Data Science', 'UI/UX Design', 'Research', 'Arduino', 'DevOps'
];

export default function CreateActivityPage() {
  const [form, setForm] = useState({
    title: '',
    category: 'Hackathon',
    description: '',
    people_needed: 2,
  });
  const [skills, setSkills] = useState(['React']);
  const [customSkill, setCustomSkill] = useState('');
  const [roles, setRoles] = useState([
    { name: 'Frontend Developer', open: 1 },
    { name: 'UI/UX Designer', open: 1 },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSkill = (s) => {
    if (skills.includes(s)) {
      setSkills(skills.filter(x => x !== s));
    } else {
      setSkills([...skills, s]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkill('');
    }
  };

  const addRole = () => {
    setRoles([...roles, { name: '', open: 1 }]);
  };

  const removeRole = (index) => {
    if (roles.length <= 1) return;
    setRoles(roles.filter((_, i) => i !== index));
  };

  const updateRole = (index, field, value) => {
    setRoles(roles.map((r, i) => {
      if (i === index) {
        return { ...r, [field]: field === 'open' ? Math.max(1, parseInt(value) || 1) : value };
      }
      return r;
    }));
  };

  // Sync total people needed with sum of open roles
  const rolesTotalSeats = roles.reduce((sum, r) => sum + (Number(r.open) || 1), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanRoles = roles.filter(r => r.name.trim() !== '');
    const needed = parseInt(form.people_needed) || rolesTotalSeats || 1;

    if (needed < 1) {
      setError('Number of people needed must be at least 1');
      return;
    }

    setLoading(true);
    try {
      const res = await createActivity({
        ...form,
        people_needed: needed,
        skills,
        roles: cleanRoles.length > 0 ? cleanRoles : [{ name: 'Teammate', open: needed }],
      });
      // Redirect straight to activity detail where recommendations are shown!
      navigate(`/activities/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-main" style={{ maxWidth: '780px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <div className="page-header-eyebrow">Party Finder</div>
          <h1>Assemble Your Squad</h1>
          <p>Post your project, outline the roles and skills you need, and discover matching peers.</p>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '2px solid var(--destructive)',
          padding: '0.75rem 1rem',
          color: 'var(--destructive)',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
          fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="pixel-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Activity / Project Title *</label>
          <input
            id="act-title"
            name="title"
            className="input"
            placeholder='e.g. SmartCampus IoT Hackathon or "2 more for Badminton"'
            value={form.title}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Category & Overall Headcount */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              id="act-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Total People Needed *</label>
            <input
              id="act-people"
              name="people_needed"
              type="number"
              min="1"
              max="50"
              value={form.people_needed}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted-fg)', marginTop: '0.2rem', display: 'block' }}>
              Roles currently total: {rolesTotalSeats} {rolesTotalSeats === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>

        {/* Description / Pitch */}
        <div>
          <label style={labelStyle}>Description & Goals</label>
          <textarea
            id="act-description"
            name="description"
            rows={4}
            className="input"
            placeholder="Tell peers what you're building, upcoming deadlines, time commitments, or event details..."
            value={form.description}
            onChange={handleChange}
            style={{ ...inputStyle, minHeight: '90px' }}
          />
        </div>

        {/* ── SKILLS NEEDED SECTION ── */}
        <div style={{
          border: '2px solid var(--navy)',
          background: 'var(--cream)',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <PixelIcon name="star" size={18} />
            <span style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.1rem', fontWeight: 700 }}>
              Skills Needed (For Peer Matching)
            </span>
          </div>
          <p style={{ color: 'var(--muted-fg)', fontSize: '0.825rem', marginBottom: '0.85rem' }}>
            Selected skills will be used to automatically recommend classmates with matching skillsets.
          </p>

          {/* Quick suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
            {SUGGESTED_SKILLS.map(s => {
              const active = skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontFamily: "'Silkscreen', monospace",
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    border: '1.5px solid var(--navy)',
                    background: active ? 'var(--mint)' : 'var(--card)',
                    color: 'var(--navy)',
                    fontWeight: active ? 700 : 500,
                    boxShadow: active ? 'var(--shadow-pixel-sm)' : 'none',
                    transition: 'all 0.1s ease',
                  }}
                >
                  {active ? `✓ ${s}` : `+ ${s}`}
                </button>
              );
            })}
          </div>

          {/* Custom skill input */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Add another skill (e.g. Solidity, Three.js)..."
              value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
              style={{ ...inputStyle, flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.875rem' }}
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="pixel-btn"
              style={{ padding: '0 1rem', fontSize: '0.85rem', background: 'var(--card)' }}
            >
              Add Skill
            </button>
          </div>

          {/* Selected skills list */}
          {skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.85rem' }}>
              {skills.map(s => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'var(--mint-soft)',
                    border: '1.5px solid var(--navy)',
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.78rem',
                    fontFamily: "'Silkscreen', monospace",
                    color: 'var(--navy)',
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => toggleSkill(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── ROLES AVAILABLE SECTION ── */}
        <div style={{
          border: '2px solid var(--navy)',
          background: 'var(--card)',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PixelIcon name="team" size={18} />
              <span style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.1rem', fontWeight: 700 }}>
                Open Roles Available
              </span>
            </div>
            <button
              type="button"
              onClick={addRole}
              style={{
                background: 'transparent',
                border: '1px solid var(--navy)',
                cursor: 'pointer',
                fontFamily: "'Pixelify Sans', monospace",
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.2rem 0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <PixelIcon name="plus" size={12} /> Add Role
            </button>
          </div>
          <p style={{ color: 'var(--muted-fg)', fontSize: '0.825rem', marginBottom: '0.85rem' }}>
            Specify the specific roles you need and how many positions are open for each.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {roles.map((role, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="e.g. Frontend Dev, UI/UX Designer, ML Engineer"
                  value={role.name}
                  onChange={e => updateRole(idx, 'name', e.target.value)}
                  style={{ ...inputStyle, flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted-fg)', whiteSpace: 'nowrap' }}>Seats:</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={role.open}
                    onChange={e => updateRole(idx, 'open', e.target.value)}
                    style={{ ...inputStyle, width: '65px', padding: '0.5rem 0.4rem', textAlign: 'center', fontSize: '0.875rem' }}
                  />
                </div>
                {roles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRole(idx)}
                    title="Remove role"
                    style={{
                      background: 'var(--orange-soft)',
                      border: '1.5px solid var(--navy)',
                      cursor: 'pointer',
                      padding: '0.5rem 0.65rem',
                      lineHeight: 1,
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          borderTop: '2px dashed rgba(26, 38, 57, 0.2)',
          paddingTop: '1.25rem',
        }}>
          <button
            type="button"
            className="pixel-btn"
            onClick={() => navigate('/activities')}
            style={{ background: 'var(--card)' }}
          >
            Cancel
          </button>
          <button
            id="create-act-submit"
            type="submit"
            className="pixel-btn pixel-btn-orange"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
          >
            <PixelIcon name="rocket" size={16} />
            {loading ? 'Publishing Post...' : 'Publish & Find Matches'}
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontFamily: "'Pixelify Sans', monospace",
  fontWeight: 700,
  fontSize: '0.95rem',
  color: 'var(--navy)',
  marginBottom: '0.35rem',
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
