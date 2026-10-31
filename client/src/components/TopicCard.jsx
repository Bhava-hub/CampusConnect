import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PixelIcon } from './Pixel';
import { AvatarDisplay } from './AvatarPicker';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function TopicCard({ topic, isBookmarked: initialBookmarked = false, onBookmarkChange }) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [saving, setSaving] = useState(false);

  const { _id, title, description, category, explanationCount = 0, user_id, createdAt } = topic;
  const date = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || saving) return;
    setSaving(true);
    try {
      if (bookmarked) {
        await api.delete(`/auth/saved/topics/${_id}`);
        setBookmarked(false);
        if (onBookmarkChange) onBookmarkChange(_id, false);
      } else {
        await api.post(`/auth/saved/topics/${_id}`);
        setBookmarked(true);
        if (onBookmarkChange) onBookmarkChange(_id, true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pixel-card-sm card-hover" style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem',
      height: '100%',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <PixelIcon name="book" size={12} />
          {category || 'General'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="label-pixel" style={{ color: 'var(--muted-fg)' }}>{date}</span>
          {user && (
            <button
              onClick={handleBookmark}
              title={bookmarked ? 'Saved' : 'Save question'}
              style={{
                background: bookmarked ? 'var(--orange-soft)' : 'transparent',
                border: '1px solid var(--navy)',
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                display: 'inline-flex',
                alignItems: 'center',
                lineHeight: 1,
              }}
            >
              <PixelIcon name="bookmark" size={12} />
            </button>
          )}
        </div>
      </div>

      <Link to={`/topics/${_id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          lineHeight: 1.3,
          color: 'var(--navy)',
        }}>
          {title}
        </h3>

        <p style={{
          color: 'var(--muted-fg)',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '1rem',
          flex: 1,
        }}>
          {description}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '2px dashed rgba(26, 38, 57, 0.2)',
          paddingTop: '0.75rem',
          marginTop: 'auto',
          fontSize: '0.82rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AvatarDisplay avatarId={user_id?.avatar || 'doge'} size={24} />
            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
              {user_id?.name || 'Anonymous'}
            </span>
          </div>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontFamily: "'Pixelify Sans', monospace",
            fontWeight: 700,
            color: 'var(--navy)',
          }}>
            <PixelIcon name="chat" size={14} />
            {explanationCount} {explanationCount === 1 ? 'answer' : 'answers'}
          </span>
        </div>
      </Link>
    </div>
  );
}
