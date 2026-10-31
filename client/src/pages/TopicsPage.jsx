import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTopics } from '../api/api';
import TopicCard from '../components/TopicCard';
import { PixelIcon } from '../components/Pixel';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Electronics', 'Mechanical', 'Economics', 'General'];

export default function TopicsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const { user } = useAuth();

  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearch(query);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    getTopics()
      .then(res => setTopics(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const filtered = topics.filter(t => {
    const matchSearch = !search ||
      (t.title + ' ' + (t.description || '')).toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' ||
      (t.category || '').toLowerCase() === category.toLowerCase();
    return matchSearch && matchCategory;
  });

  return (
    <div className="page-main">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-header-eyebrow">Knowledge Base</div>
          <h1>Ask & Answer</h1>
          <p>Get stuck on a concept? Ask peers for simplified, ELI5-style explanations.</p>
        </div>
        {user ? (
          <Link
            to="/create-topic"
            className="pixel-btn"
            id="create-topic-btn"
            style={{ background: 'var(--mint)', color: 'var(--navy)' }}
          >
            <PixelIcon name="plus" size={14} /> Ask Question
          </Link>
        ) : (
          <Link to="/login" className="pixel-btn pixel-btn-outline">
            Log in to Ask
          </Link>
        )}
      </div>

      {/* Search Input */}
      <label className="search-bar" style={{ display: 'block', marginBottom: '1.25rem' }}>
        <span className="search-icon"><PixelIcon name="search" size={16} /></span>
        <input
          id="topics-search"
          placeholder="Search by topic title, keywords, or concept..."
          value={search}
          onChange={handleSearchChange}
        />
      </label>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setCategory(cat)}
            style={{
              padding: '0.4rem 0.85rem',
              fontFamily: "'Silkscreen', monospace",
              fontSize: '0.78rem',
              border: '2px solid var(--navy)',
              cursor: 'pointer',
              background: category === cat ? 'var(--navy)' : 'var(--card)',
              color: category === cat ? 'var(--cream)' : 'var(--navy)',
              boxShadow: category === cat ? 'var(--shadow-pixel-sm)' : 'none',
              transition: 'all 0.1s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--mint-soft)', borderTop: '3px solid var(--navy)', borderRadius: '50%' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="pixel-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <PixelIcon name="question" size={40} style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--muted-fg)', fontSize: '1rem', marginBottom: '1rem' }}>
            No questions found matching your criteria.
          </p>
          {user && (
            <Link to="/create-topic" className="pixel-btn pixel-btn-mint" style={{ display: 'inline-flex' }}>
              Ask the First Question
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map(topic => <TopicCard key={topic._id} topic={topic} />)}
        </div>
      )}
    </div>
  );
}
