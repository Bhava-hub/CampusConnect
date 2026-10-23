import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTopicById, createExplain, deleteTopic } from '../api/api';
import { useAuth } from '../context/AuthContext';
import ExplanationCard from '../components/ExplanationCard';

export default function TopicDetailPage() {
  const { id }                    = useParams();
  const { user }                  = useAuth();
  const navigate                  = useNavigate();
  const [data,    setData]        = useState(null);
  const [loading, setLoading]     = useState(true);
  const [content, setContent]     = useState('');
  const [posting, setPosting]     = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [error,   setError]       = useState('');

  const loadTopic = () => {
    return getTopicById(id)
      .then((res) => setData(res.data))
      .catch(() => navigate('/topics'));
  };

  useEffect(() => {
    loadTopic().finally(() => setLoading(false));
  }, [id]);

  const handleDeleteTopic = async () => {
    if (!window.confirm('Are you sure you want to delete this topic and all its explanations?')) return;
    setDeleting(true);
    try {
      await deleteTopic(id);
      navigate('/topics');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete topic');
      setDeleting(false);
    }
  };

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!content.trim()) return;
    setPosting(true);
    setError('');
    try {
      const res = await createExplain(id, { content });
      setData((prev) => ({ ...prev, explanations: [res.data, ...prev.explanations] }));
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post explanation');
    } finally {
      setPosting(false);
    }
  };

  const handleUpvote = (updated) => {
    setData((prev) => ({
      ...prev,
      explanations: prev.explanations
        .map((e) => e._id === updated._id ? updated : e)
        .sort((a, b) => b.upvotes.length - a.upvotes.length),
    }));
  };

  const handleExplanationDeleted = (deletedId) => {
    setData((prev) => ({
      ...prev,
      explanations: prev.explanations.filter((e) => e._id !== deletedId),
    }));
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="animate-spin" style={{
        width: 40, height: 40, border: '3px solid rgba(13,148,136,0.2)',
        borderTop: '3px solid #14b8a6', borderRadius: '50%' }} />
    </div>
  );

  const { topic, explanations } = data;
  const isCreator = user && topic.user_id?._id === user._id;
  const canDeleteTopic = user && (isCreator || user.role === 'admin');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/topics" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          ← Back to Topics
        </Link>
        {canDeleteTopic && (
          <button
            className="btn btn-danger"
            onClick={handleDeleteTopic}
            disabled={deleting}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.825rem' }}
          >
            {deleting ? 'Deleting...' : user.role === 'admin' && !isCreator ? '🗑️ Admin Delete Topic' : '🗑️ Delete Topic'}
          </button>
        )}
      </div>

      {/* Topic header */}
      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span className="badge badge-teal">{topic.category}</span>
          {user?.role === 'admin' && <span className="badge badge-purple">🛡️ Admin</span>}
        </div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', lineHeight: 1.35 }}>{topic.title}</h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '1rem' }}>{topic.description}</p>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
          by <strong style={{ color: '#94a3b8' }}>{topic.user_id?.name}</strong>
          {topic.user_id?.department && ` · ${topic.user_id.department}`}
        </span>
      </div>

      {/* Post explanation */}
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#e2e8f0' }}>
          ✍️ Write an ELI5 Explanation
        </h2>
        {error && (
          <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>
        )}
        <form onSubmit={handleExplain} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea id="explain-content" className="input"
            placeholder="Explain this simply, like you're explaining to a friend..."
            value={content} onChange={(e) => setContent(e.target.value)}
            style={{ minHeight: 140 }} />
          <button id="explain-submit" type="submit" className="btn btn-primary"
            disabled={posting || !content.trim()} style={{ alignSelf: 'flex-start' }}>
            {posting ? 'Posting...' : 'Post Explanation'}
          </button>
          {!user && (
            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
              <Link to="/login" style={{ color: '#14b8a6' }}>Sign in</Link> to post an explanation
            </p>
          )}
        </form>
      </div>

      {/* Explanations list */}
      <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#e2e8f0' }}>
        💬 {explanations.length} Explanation{explanations.length !== 1 ? 's' : ''}
        {explanations.length > 0 && <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.85rem' }}> · sorted by upvotes</span>}
      </h2>

      {explanations.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#94a3b8' }}>No explanations yet — be the first to explain! 🌟</p>
        </div>
      ) : (
        explanations.map((exp) => (
          <ExplanationCard
            key={exp._id}
            explanation={exp}
            onUpvote={handleUpvote}
            onDelete={handleExplanationDeleted}
          />
        ))
      )}
    </div>
  );
}
