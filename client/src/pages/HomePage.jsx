import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTopics, getActivities } from '../api/api';
import TopicCard from '../components/TopicCard';
import ActivityCard from '../components/ActivityCard';
import { PixelIcon, PixelStars } from '../components/Pixel';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [topics, setTopics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTopics().then(res => res.data).catch(() => []),
      getActivities().then(res => res.data).catch(() => []),
    ]).then(([tData, aData]) => {
      setTopics(Array.isArray(tData) ? tData.slice(0, 4) : []);
      setActivities(Array.isArray(aData) ? aData.slice(0, 4) : []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/topics?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="page-main" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero section */}
      <section className="pixel-card" style={{
        position: 'relative',
        background: 'var(--navy)',
        color: 'var(--cream)',
        padding: '2.5rem 2rem',
        overflow: 'hidden',
      }}>
        <PixelStars style={{ position: 'absolute', right: '1.5rem', top: '1.5rem' }} />
        <div className="label-pixel" style={{ color: 'var(--mint)', marginBottom: '0.5rem' }}>
          {user ? `Welcome back, ${user.name}` : 'Campus Knowledge & Squad Finder'}
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          maxWidth: '750px',
          marginBottom: '1rem',
          color: 'var(--cream)',
        }}>
          Level up your campus connections.
        </h1>
        <p style={{
          color: 'var(--muted)',
          fontSize: '1.05rem',
          maxWidth: '620px',
          marginBottom: '1.75rem',
          lineHeight: 1.6,
        }}>
          A lightweight social layer for campus life — get your doubts explained by peers and find teammates with the exact skills you need.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '640px', display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}>
              <PixelIcon name="search" size={16} />
            </span>
            <input
              id="hero-search"
              type="text"
              placeholder="Search doubts, subjects, projects, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.6rem',
                border: '2px solid var(--navy)',
                fontFamily: "'Rubik', sans-serif",
                fontSize: '0.95rem',
                background: 'var(--card)',
                color: 'var(--navy)',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            className="pixel-btn"
            id="hero-search-btn"
            style={{
              background: 'var(--orange)',
              color: 'var(--cream)',
              padding: '0 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <PixelIcon name="search" size={16} /> Search
          </button>
        </form>

        {/* Quick tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
          {['algorithms', 'hackathon', 'data science', 'react', 'research', 'figma'].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearch(tag);
                navigate(`/topics?search=${encodeURIComponent(tag)}`);
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'var(--cream)',
                padding: '0.2rem 0.6rem',
                fontFamily: "'Silkscreen', monospace",
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>

      {/* Two Pillars Banner */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <Link
          to="/topics"
          className="pixel-card card-hover"
          style={{
            padding: '1.75rem',
            background: 'var(--mint-soft)',
            textDecoration: 'none',
            color: 'var(--navy)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div style={{
            width: 68,
            height: 68,
            border: '2px solid var(--navy)',
            background: 'var(--card)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-pixel-sm)',
          }}>
            <PixelIcon name="question" size={40} />
          </div>
          <div>
            <span className="label-pixel" style={{ color: 'var(--navy)', fontWeight: 700 }}>Ask & Answer</span>
            <h2 style={{ fontSize: '1.4rem', margin: '0.2rem 0 0.4rem' }}>Explain It</h2>
            <p style={{ color: 'var(--muted-fg)', fontSize: '0.875rem' }}>
              Stuck on a tricky concept? Get clear peer explanations and upvote the best answers.
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: '0.6rem',
              fontFamily: "'Pixelify Sans', monospace",
              fontWeight: 700,
              textDecoration: 'underline',
            }}>
              Browse questions →
            </span>
          </div>
        </Link>

        <Link
          to="/activities"
          className="pixel-card card-hover"
          style={{
            padding: '1.75rem',
            background: 'var(--orange-soft)',
            textDecoration: 'none',
            color: 'var(--navy)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div style={{
            width: 68,
            height: 68,
            border: '2px solid var(--navy)',
            background: 'var(--card)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-pixel-sm)',
          }}>
            <PixelIcon name="team" size={40} />
          </div>
          <div>
            <span className="label-pixel" style={{ color: 'var(--navy)', fontWeight: 700 }}>Find Teammates</span>
            <h2 style={{ fontSize: '1.4rem', margin: '0.2rem 0 0.4rem' }}>One More Person</h2>
            <p style={{ color: 'var(--muted-fg)', fontSize: '0.875rem' }}>
              Recruit teammates with the right skills for hackathons, research, games, and clubs.
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: '0.6rem',
              fontFamily: "'Pixelify Sans', monospace",
              fontWeight: 700,
              textDecoration: 'underline',
            }}>
              Find teammates →
            </span>
          </div>
        </Link>
      </section>

      {/* Recent Questions Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div className="label-pixel" style={{ color: 'var(--orange)' }}>Peer Knowledge</div>
            <h2 style={{ fontSize: '1.6rem' }}>Recent Questions</h2>
          </div>
          <Link to="/topics" className="pixel-btn" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--mint-soft)', borderTop: '3px solid var(--navy)', borderRadius: '50%' }} />
          </div>
        ) : topics.length === 0 ? (
          <div className="pixel-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <PixelIcon name="question" size={36} style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--muted-fg)' }}>No questions posted yet.</p>
            <Link to="/create-topic" className="pixel-btn pixel-btn-mint" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
              Ask the First Question
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {topics.map(t => <TopicCard key={t._id} topic={t} />)}
          </div>
        )}
      </section>

      {/* Teams Recruiting Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div className="label-pixel" style={{ color: 'var(--mint)' }}>Party Finder</div>
            <h2 style={{ fontSize: '1.6rem' }}>Teams Recruiting</h2>
          </div>
          <Link to="/activities" className="pixel-btn" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--mint-soft)', borderTop: '3px solid var(--navy)', borderRadius: '50%' }} />
          </div>
        ) : activities.length === 0 ? (
          <div className="pixel-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <PixelIcon name="team" size={36} style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--muted-fg)' }}>No active squads looking for members.</p>
            <Link to="/create-activity" className="pixel-btn pixel-btn-orange" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
              Post an Activity
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {activities.map(a => <ActivityCard key={a._id} activity={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
