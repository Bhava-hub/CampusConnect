import { Link } from 'react-router-dom';

export default function TopicCard({ topic }) {
  const { _id, title, description, category, explanationCount, user_id, createdAt } = topic;
  const date = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <Link to={`/topics/${_id}`} style={{ textDecoration: 'none' }}>
      <div className="glass card-hover animate-fadeIn" style={{ padding: '1.5rem', cursor: 'pointer' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span className="badge badge-teal">{category || 'General'}</span>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{date}</span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem', lineHeight: 1.4 }}>
          {title}
        </h3>

        {/* Description snippet */}
        <p style={{
          color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: '1rem',
        }}>
          {description}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
            by <strong style={{ color: '#94a3b8' }}>{user_id?.name || 'Anonymous'}</strong>
            {user_id?.department && ` · ${user_id.department}`}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#14b8a6', fontSize: '0.85rem', fontWeight: 600 }}>
            💬 {explanationCount || 0} explanation{explanationCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
