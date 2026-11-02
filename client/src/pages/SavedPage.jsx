import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { PixelIcon } from '../components/Pixel';

export default function SavedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedTopics, setSavedTopics] = useState([]);
  const [savedActivities, setSavedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('topics');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/auth/saved')
      .then(res => {
        setSavedTopics(res.data.savedTopics || []);
        setSavedActivities(res.data.savedActivities || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const unsaveTopic = async (topicId) => {
    try {
      await api.delete(`/auth/saved/topics/${topicId}`);
      setSavedTopics(prev => prev.filter(t => t._id !== topicId));
    } catch (err) { console.error(err); }
  };

  const unsaveActivity = async (actId) => {
    try {
      await api.delete(`/auth/saved/activities/${actId}`);
      setSavedActivities(prev => prev.filter(a => a._id !== actId));
    } catch (err) { console.error(err); }
  };

  if (!user) return null;

  return (
    <div className="page-main">
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-header-eyebrow">Inventory</div>
          <h1>Saved Posts</h1>
          <p>Everything you bookmarked for later.</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', border: '2px solid var(--navy)', width: 'fit-content', marginBottom: '1.5rem' }}>
        {[
          { id: 'topics', label: 'Questions', icon: 'question', count: savedTopics.length },
          { id: 'activities', label: 'Activities', icon: 'team', count: savedActivities.length },
        ].map(t => (
          <button key={t.id}
            id={`saved-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            style={{ padding: '0.6rem 1.25rem', fontFamily: "'Pixelify Sans', monospace", fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', background: tab === t.id ? 'var(--navy)' : 'var(--card)', color: tab === t.id ? 'var(--cream)' : 'var(--navy)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PixelIcon name={t.icon} size={14} />
            {t.label}
            <span style={{ fontSize: '0.75rem', fontFamily: "'Silkscreen', monospace", background: tab === t.id ? 'rgba(255,255,255,0.2)' : 'var(--muted)', padding: '0.1rem 0.4rem', borderRadius: 2 }}>              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--mint-soft)', borderTop: '3px solid var(--navy)', borderRadius: '50%' }} />
        </div>
      ) : tab === 'topics' ? (
        savedTopics.length === 0 ? (
          <div className="pixel-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <PixelIcon name="bookmark" size={40} style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--muted-fg)' }}>No saved questions yet.</p>
            <Link to="/topics" className="pixel-btn" style={{ marginTop: '1rem', display: 'inline-flex' }}>Browse Questions</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {savedTopics.map(topic => (
              <div key={topic._id} className="pixel-card-sm card-hover" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Link to={`/topics/${topic._id}`} style={{ flex: 1, textDecoration: 'none', color: 'var(--navy)', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-teal">{topic.category || 'General'}</span>
                    <span className="label-pixel" style={{ color: 'var(--muted-fg)' }}>
                      {new Date(topic.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    {topic.title}
                  </h3>
                  <p style={{ color: 'var(--muted-fg)', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {topic.description}
                  </p>
                </Link>
                <button
                  title="Remove bookmark"
                  onClick={() => unsaveTopic(topic._id)}
                  style={{ border: '2px solid var(--navy)', background: 'var(--orange-soft)', padding: '0.4rem 0.6rem', cursor: 'pointer', flexShrink: 0, lineHeight: 1 }}
                >
                  <PixelIcon name="bookmark" size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        savedActivities.length === 0 ? (
          <div className="pixel-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <PixelIcon name="bookmark" size={40} style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--muted-fg)' }}>No saved activities yet.</p>
            <Link to="/activities" className="pixel-btn" style={{ marginTop: '1rem', display: 'inline-flex' }}>Browse Activities</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {savedActivities.map(a => (
              <div key={a._id} className="pixel-card-sm card-hover" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Link to={`/activities/${a._id}`} style={{ flex: 1, textDecoration: 'none', color: 'var(--navy)', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${a.status === 'closed' ? 'badge-red' : 'badge-teal'}`}>{a.status === 'closed' ? 'Full' : 'Open'}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    {a.title}
                  </h3>
                  <p style={{ color: 'var(--muted-fg)', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {a.description}
                  </p>
                </Link>
                <button
                  title="Remove bookmark"
                  onClick={() => unsaveActivity(a._id)}
                  style={{ border: '2px solid var(--navy)', background: 'var(--orange-soft)', padding: '0.4rem 0.6rem', cursor: 'pointer', flexShrink: 0, lineHeight: 1 }}
                >
                  <PixelIcon name="bookmark" size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
