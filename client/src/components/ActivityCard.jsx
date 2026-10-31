import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PixelIcon } from './Pixel';
import { AvatarDisplay } from './AvatarPicker';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function ActivityCard({ activity, isBookmarked: initialBookmarked = false, onBookmarkChange }) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [saving, setSaving] = useState(false);

  const {
    _id,
    title,
    description,
    people_needed = 1,
    memberCount = 0,
    status = 'open',
    category = 'General',
    skills = [],
    roles = [],
    user_id,
    createdAt,
  } = activity;

  const date = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const isFull = status === 'closed' || memberCount >= people_needed;
  const percent = Math.min(Math.round((memberCount / (people_needed || 1)) * 100), 100);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || saving) return;
    setSaving(true);
    try {
      if (bookmarked) {
        await api.delete(`/auth/saved/activities/${_id}`);
        setBookmarked(false);
        if (onBookmarkChange) onBookmarkChange(_id, false);
      } else {
        await api.post(`/auth/saved/activities/${_id}`);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${isFull ? 'badge-red' : 'badge-teal'}`}>
            {isFull ? 'Full' : 'Open'}
          </span>
          {category && <span className="label-pixel" style={{ color: 'var(--muted-fg)' }}>{category}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="label-pixel" style={{ color: 'var(--muted-fg)' }}>{date}</span>
          {user && (
            <button
              onClick={handleBookmark}
              title={bookmarked ? 'Saved' : 'Save activity'}
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

      <Link to={`/activities/${_id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          marginBottom: '0.4rem',
          lineHeight: 1.3,
          color: 'var(--navy)',
        }}>
          {title}
        </h3>

        {description && (
          <p style={{
            color: 'var(--muted-fg)',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '0.75rem',
          }}>
            {description}
          </p>
        )}

        {skills && skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
            {skills.map(s => (
              <span key={s} style={{
                fontSize: '0.75rem',
                fontFamily: "'Silkscreen', monospace",
                border: '1px solid var(--navy)',
                padding: '0.1rem 0.4rem',
                background: 'var(--mint-soft)',
                color: 'var(--navy)',
              }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {roles && roles.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
            marginBottom: '0.75rem',
            paddingTop: '0.4rem',
            borderTop: '1px dashed rgba(26, 38, 57, 0.15)',
          }}>
            {roles.slice(0, 3).map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--navy)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <PixelIcon name="user" size={12} /> {r.name}
                </span>
                <span style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700 }}>
                  {r.open} {r.open === 1 ? 'seat' : 'seats'}
                </span>
              </div>
            ))}
            {roles.length > 3 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--muted-fg)' }}>+{roles.length - 3} more roles</span>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginTop: 'auto', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--muted-fg)' }}>Members filled</span>
            <span style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700 }}>
              {memberCount} / {people_needed}
            </span>
          </div>
          <div style={{ height: 8, border: '2px solid var(--navy)', background: 'var(--cream)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${percent}%`,
              background: isFull ? 'var(--orange)' : 'var(--mint)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '2px dashed rgba(26, 38, 57, 0.2)',
          paddingTop: '0.65rem',
          fontSize: '0.82rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AvatarDisplay avatarId={user_id?.avatar || 'doge'} size={24} />
            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
              {user_id?.name || 'Anonymous'}
            </span>
          </div>
          <span style={{ color: 'var(--muted-fg)', fontSize: '0.78rem' }}>
            {user_id?.department ? user_id.department : 'Campus'}
          </span>
        </div>
      </Link>
    </div>
  );
}
