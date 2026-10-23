import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActivity } from '../api/api';

export default function CreateActivityPage() {
  const [form, setForm]       = useState({ title: '', description: '', people_needed: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const needed = parseInt(form.people_needed);
    if (!needed || needed < 1) { setError('People needed must be at least 1'); return; }
    setLoading(true);
    try {
      const res = await createActivity({ ...form, people_needed: needed });
      navigate(`/activities/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>🎯 Post an Activity</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Tell people what you need — "2 more for badminton" or "1 teammate for hackathon"
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {error}
        </div>
      )}

      <div className="glass" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Activity Title *</label>
            <input id="act-title" name="title" className="input"
              placeholder='e.g. "2 more for badminton" or "Hackathon teammates"'
              value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <label style={labelStyle}>Description <span style={{ color: '#64748b' }}>(optional)</span></label>
            <textarea id="act-description" name="description" className="input"
              placeholder="Any extra details — time, place, skill level..."
              value={form.description} onChange={handleChange} style={{ minHeight: 100 }} />
          </div>
          <div>
            <label style={labelStyle}>People Needed *</label>
            <input id="act-people" name="people_needed" type="number" min="1" max="50" className="input"
              placeholder="e.g. 2" value={form.people_needed} onChange={handleChange} required />
            <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.3rem' }}>
              Activity auto-closes when this many people join
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button id="create-act-submit" type="submit" className="btn btn-purple" disabled={loading}>
              {loading ? 'Posting...' : '🎯 Post Activity'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/activities')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' };
