import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActivities } from '../api/api';
import ActivityCard from '../components/ActivityCard';
import { PixelIcon } from '../components/Pixel';
import { useAuth } from '../context/AuthContext';

const COMMON_SKILLS = ['React', 'Python', 'ML/AI', 'Figma', 'Java', 'C++', 'Node.js', 'Flutter', 'Research', 'Design', 'Arduino', 'Data Science'];
const CATEGORIES = ['All', 'Hackathon', 'Research', 'Competition', 'Sports', 'Arts', 'General'];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState([]);
  const [category, setCategory] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    getActivities(params)
      .then(res => setActivities(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const toggleSkill = (skill) => {
    setSkillFilter(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const filtered = activities.filter(a => {
    const matchSearch = !search || (a.title + ' ' + (a.description || '')).toLowerCase().includes(search.toLowerCase());
    const matchSkills = skillFilter.length === 0 || skillFilter.some(s => (a.skills || []).map(sk => sk.toLowerCase()).includes(s.toLowerCase()));
    const matchCategory = category === 'All' || (a.category || '').toLowerCase() === category.toLowerCase();
    return matchSearch && matchSkills && matchCategory;
  });

  return (
    <div className="page-main">
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-header-eyebrow">Party Finder</div>
          <h1>Find Teammates</h1>
          <p>Discover activities that need your skills — or recruit the missing piece of yours.</p>
        </div>
        {user && (
          <Link to="/create-activity" className="pixel-btn" id="create-activity-btn" style={{ background: 'var(--orange)', color: 'var(--cream)' }}>
            <PixelIcon name="plus" size={14} /> Post Activity
          </Link>
        )}
      </div>

      {/* Search */}
      <label className="search-bar" style={{ display: 'block', marginBottom: '1rem' }}>
        <span className="search-icon"><PixelIcon name="search" size={16} /></span>
        <input
          id="activity-search"
          placeholder="Search by project, skill, or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </label>

      {/* Filters row */}
      <div className="pixel-card-sm" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {[{ v: 'open', l: '🟢 Open' }, { v: 'closed', l: '🔴 Full' }, { v: 'all', l: 'All' }].map(({ v, l }) => (
            <button key={v} id={`filter-${v}`}
              onClick={() => setFilter(v)}
              style={{ padding: '0.3rem 0.85rem', fontSize: '0.8rem', fontFamily: "'Silkscreen', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', border: '2px solid var(--navy)', borderRadius: 2, background: filter === v ? 'var(--navy)' : 'var(--card)', color: filter === v ? 'var(--cream)' : 'var(--navy)' }}>
              {l}
            </button>
          ))}
          <div style={{ width: '1px', background: 'var(--navy)', opacity: 0.2, margin: '0 0.25rem' }} />
          {CATEGORIES.map(c => (
            <button key={c}
              onClick={() => setCategory(c)}
              style={{ padding: '0.3rem 0.85rem', fontSize: '0.8rem', fontFamily: "'Silkscreen', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', border: '2px solid var(--navy)', borderRadius: 2, background: category === c ? 'var(--orange)' : 'var(--card)', color: category === c ? 'var(--cream)' : 'var(--navy)' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Skills filter — key section */}
        <div>
          <div className="label-pixel" style={{ marginBottom: '0.5rem', color: 'var(--muted-fg)' }}>
            Filter by Skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {COMMON_SKILLS.map(skill => {
              const active = skillFilter.includes(skill);
              return (
                <button key={skill}
                  onClick={() => toggleSkill(skill)}
                  aria-pressed={active}
                  style={{ border: '2px solid var(--navy)', padding: '0.2rem 0.65rem', borderRadius: 2, cursor: 'pointer', fontFamily: "'Silkscreen', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: active ? 'var(--mint)' : 'var(--card)', color: 'var(--navy)', boxShadow: active ? 'none' : 'var(--shadow-pixel-sm)', transition: 'all 0.08s' }}>
                  {active && '✓ '}{skill}
                </button>
              );
            })}
            {skillFilter.length > 0 && (
              <button onClick={() => setSkillFilter([])} style={{ border: '2px solid var(--destructive)', padding: '0.2rem 0.65rem', borderRadius: 2, cursor: 'pointer', fontFamily: "'Silkscreen', monospace", fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--destructive)', background: 'var(--card)' }}>
                Clear ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--mint-soft)', borderTop: '3px solid var(--navy)', borderRadius: '50%' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="pixel-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <PixelIcon name="team" size={40} style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--muted-fg)', fontSize: '1rem' }}>
            No activities match — {user ? <Link to="/create-activity" style={{ color: 'var(--orange)', fontWeight: 600, textDecoration: 'none' }}>post the first one!</Link> : 'log in to post one'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map(activity => <ActivityCard key={activity._id} activity={activity} />)}
        </div>
      )}
    </div>
  );
}