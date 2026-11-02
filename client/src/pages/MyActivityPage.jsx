import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTopics, getActivities } from '../api/api';
import { PixelIcon } from '../components/Pixel';

export default function MyActivityPage() {
  const { user }          = useAuth();
  const navigate          = useNavigate();
  const [myTopics,        setMyTopics]        = useState([]);
  const [myActivities,    setMyActivities]    = useState([]);
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      getTopics({}),
      getActivities({}),
    ]).then(([topicsRes, activitiesRes]) => {
      const topics     = topicsRes.data;
      const activities = activitiesRes.data;

      setMyTopics(topics.filter(t => t.user_id?._id === user._id || t.user_id === user._id));
      setMyActivities(activities.filter(a => a.user_id?._id === user._id || a.user_id === user._id));
      // joined activities — those where user is in members but didn't create
      setJoinedActivities(activities.filter(a => {
        const isOwner = a.user_id?._id === user._id || a.user_id === user._id;
        const inMembers = (a.members || []).some(m => m.user_id?._id === user._id || m.user_id === user._id);
        return !isOwner && inMembers;
      }));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const stats = [
    { label: 'Topics Posted',      val: myTopics.length,        icon: 'question', bg: 'var(--mint-soft)' },
    { label: 'Activities Posted',  val: myActivities.length,    icon: 'team',     bg: 'var(--orange-soft)' },
    { label: 'Activities Joined',  val: joinedActivities.length, icon: 'heart',   bg: 'var(--muted)' },
    { label: 'Reputation Points',  val: user.reputation_pts || 0, icon: 'star',   bg: 'var(--mint-soft)' },
  ];

  return (
    <div className="page-main">
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-header-eyebrow">Quest Log</div>
          <h1>My Activity</h1>
          <p>Track everything you've posted and joined on CampusConnect.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} className="pixel-card-sm stat-block" style={{ background: s.bg }}>
            <PixelIcon name={s.icon} size={24} />
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--mint-soft)', borderTop: '3px solid var(--navy)', borderRadius: '50%' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* My Topics */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PixelIcon name="question" size={20} /> Topics I Posted
              </h2>
              <Link to="/topics" style={{ fontSize: '0.85rem', color: 'var(--orange)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
            </div>
            {myTopics.length === 0 ? (
              <div className="pixel-card-sm" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-fg)' }}>
                <PixelIcon name="question" size={32} style={{ margin: '0 auto 0.75rem' }} />
                <p>No topics posted yet.</p>
                <Link to="/create-topic" className="pixel-btn" style={{ background: 'var(--orange)', color: 'var(--cream)', marginTop: '1rem', display: 'inline-flex' }}>
                  Post a Topic
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myTopics.map(topic => (
                  <Link key={topic._id} to={`/topics/${topic._id}`} className="pixel-card-sm card-hover" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--navy)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 600 }}>{topic.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-fg)', marginTop: '0.2rem' }}>
                        {topic.category} · {new Date(topic.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, flexShrink: 0 }}>
                      <PixelIcon name="chat" size={14} /> {topic.explanationCount || 0}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* My Activities */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PixelIcon name="team" size={20} /> Activities I Posted
              </h2>
              <Link to="/activities" style={{ fontSize: '0.85rem', color: 'var(--orange)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
            </div>
            {myActivities.length === 0 ? (
              <div className="pixel-card-sm" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-fg)' }}>
                <PixelIcon name="team" size={32} style={{ margin: '0 auto 0.75rem' }} />
                <p>No activities posted yet.</p>
                <Link to="/create-activity" className="pixel-btn" style={{ background: 'var(--orange)', color: 'var(--cream)', marginTop: '1rem', display: 'inline-flex' }}>
                  Post Activity
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myActivities.map(a => (
                  <Link key={a._id} to={`/activities/${a._id}`} className="pixel-card-sm card-hover" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--navy)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 600 }}>{a.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-fg)', marginTop: '0.2rem' }}>
                        {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <span className={`badge ${a.status === 'closed' ? 'badge-red' : 'badge-teal'}`} style={{ flexShrink: 0 }}>
                      {a.status === 'closed' ? 'Full' : 'Open'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Activities Joined */}
          <section>
            <h2 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PixelIcon name="heart" size={20} /> Activities I Joined
            </h2>
            {joinedActivities.length === 0 ? (
              <div className="pixel-card-sm" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-fg)' }}>
                <PixelIcon name="bookmark" size={32} style={{ margin: '0 auto 0.75rem' }} />
                <p>You haven't joined any activities yet.</p>
                <Link to="/activities" className="pixel-btn" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                  Browse Activities
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {joinedActivities.map(a => (
                  <Link key={a._id} to={`/activities/${a._id}`} className="pixel-card-sm card-hover" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--navy)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 600 }}>{a.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-fg)', marginTop: '0.2rem' }}>by {a.user_id?.name || 'Unknown'}</div>
                    </div>
                    <PixelIcon name="check" size={16} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
