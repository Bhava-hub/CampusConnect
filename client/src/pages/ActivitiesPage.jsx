import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActivities } from '../api/api';
import ActivityCard from '../components/ActivityCard';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('open');

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    getActivities(params)
      .then((res) => setActivities(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
            👥 <span className="gradient-text">One More Person</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Find your next teammate or post an activity that needs people</p>
        </div>
        <Link to="/create-activity" className="btn btn-purple" id="create-activity-btn">
          + Post Activity
        </Link>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[
          { value: 'open', label: '🟢 Open' },
          { value: 'closed', label: '🔴 Full' },
          { value: 'all', label: 'All' },
        ].map(({ value, label }) => (
          <button key={value} id={`filter-${value}`}
            onClick={() => setFilter(value)}
            className="btn"
            style={{
              padding: '0.35rem 1rem', fontSize: '0.85rem',
              background: filter === value ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
              color: filter === value ? '#a78bfa' : '#94a3b8',
              border: `1px solid ${filter === value ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.07)'}`,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="animate-spin" style={{
            width: 40, height: 40, border: '3px solid rgba(124,58,237,0.2)',
            borderTop: '3px solid #a78bfa', borderRadius: '50%' }} />
        </div>
      ) : activities.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎯</p>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            No activities yet — <Link to="/create-activity" style={{ color: '#a78bfa', fontWeight: 600 }}>post the first one!</Link>
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {activities.map((activity) => <ActivityCard key={activity._id} activity={activity} />)}
        </div>
      )}
    </div>
  );
}
