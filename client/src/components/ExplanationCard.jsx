import { useState } from 'react';
import { upvoteExplain, deleteExplanation } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ExplanationCard({ explanation, onUpvote, onDelete }) {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { _id, content, user_id, upvotes, createdAt } = explanation;
  const hasUpvoted = user && upvotes?.includes(user._id);
  const isAuthor = user && user_id?._id === user._id;
  const canDelete = user && (isAuthor || user.role === 'admin');
  const date = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const handleUpvote = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await upvoteExplain(_id);
      onUpvote(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this explanation?')) return;
    setDeleting(true);
    try {
      await deleteExplanation(_id);
      if (onDelete) onDelete(_id);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete explanation');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="glass animate-fadeIn" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      {/* Author row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d9488, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.85rem',
          }}>
            {user_id?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0' }}>{user_id?.name}</p>
            {user_id?.department && (
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{user_id.department}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user_id?.reputation_pts > 0 && (
            <span className="badge badge-teal">★ {user_id.reputation_pts}</span>
          )}
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{date}</span>
        </div>
      </div>

      {/* Content */}
      <p style={{ color: '#cbd5e1', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: '1rem' }}>
        {content}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          id={`upvote-${_id}`}
          className="btn"
          onClick={handleUpvote}
          disabled={loading}
          style={{
            background: hasUpvoted ? 'rgba(13,148,136,0.2)' : 'rgba(255,255,255,0.05)',
            color: hasUpvoted ? '#14b8a6' : '#94a3b8',
            border: `1px solid ${hasUpvoted ? 'rgba(13,148,136,0.4)' : 'rgba(255,255,255,0.07)'}`,
            fontSize: '0.85rem', padding: '0.4rem 0.9rem',
          }}
        >
          {loading ? '...' : `▲ ${upvotes?.length || 0}`}
        </button>

        {canDelete && (
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.775rem' }}
          >
            {deleting ? 'Deleting...' : '🗑️ Delete'}
          </button>
        )}
      </div>
    </div>
  );
}

