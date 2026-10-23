import { Link } from 'react-router-dom';

export default function ActivityCard({ activity }) {
  const { _id, title, description, people_needed, memberCount = 0, status, user_id, createdAt } = activity;
  const date    = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const isFull  = status === 'closed';
  const percent = Math.min((memberCount / people_needed) * 100, 100);

  return (
    <Link to={`/activities/${_id}`} style={{ textDecoration: 'none' }}>
      <div className="glass card-hover animate-fadeIn" style={{ padding: '1.5rem', cursor: 'pointer' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span className={`badge ${isFull ? 'badge-red' : 'badge-green'}`}>
            {isFull ? '🔴 Full' : '🟢 Open'}
          </span>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{date}</span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p style={{
            color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            marginBottom: '1rem',
          }}>
            {description}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Members joined</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isFull ? '#f87171' : '#4ade80' }}>
              {memberCount} / {people_needed}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.07)' }}>
            <div style={{
              height: '100%', borderRadius: 999, width: `${percent}%`,
              background: isFull
                ? 'linear-gradient(90deg, #ef4444, #f87171)'
                : 'linear-gradient(90deg, #0d9488, #14b8a6)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Footer */}
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
          by <strong style={{ color: '#94a3b8' }}>{user_id?.name || 'Anonymous'}</strong>
          {user_id?.department && ` · ${user_id.department}`}
        </span>
      </div>
    </Link>
  );
}
