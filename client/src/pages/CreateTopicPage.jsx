import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTopic } from '../api/api';

const CATEGORIES = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Electronics', 'Mechanical', 'Civil', 'Economics'];

export default function CreateTopicPage() {
  const [form, setForm]       = useState({ title: '', description: '', category: 'General' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await createTopic(form);
      navigate(`/topics/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>📌 Post a Topic</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Describe what you don't understand — peers will explain it ELI5 style
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
            <label style={labelStyle}>Topic Title *</label>
            <input id="topic-title" name="title" className="input"
              placeholder="e.g. What is Big O notation?" value={form.title}
              onChange={handleChange} required />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select id="topic-category" name="category" className="input" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea id="topic-description" name="description" className="input"
              placeholder="Give more context about what you're struggling with..."
              value={form.description} onChange={handleChange} required
              style={{ minHeight: 150 }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button id="create-topic-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : '📌 Post Topic'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/topics')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' };
