import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopics } from '../api/api';
import TopicCard from '../components/TopicCard';

const CATEGORIES = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Electronics', 'Mechanical', 'Civil', 'Economics', 'General'];

export default function TopicsPage() {
  const [topics,   setTopics]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchTopics();
  }, [search, category]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)            params.search = search;
      if (category !== 'All') params.category = category;
      const res = await getTopics(params);
      setTopics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
            🧠 <span className="gradient-text">Explain It</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Browse peer-explained topics or post your own doubt</p>
        </div>
        <Link to="/create-topic" className="btn btn-primary" id="create-topic-btn">
          + Post a Topic
        </Link>
      </div>

      {/* Search bar */}
      <input id="topic-search" className="input" placeholder="🔍 Search topics..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '1rem' }} />

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {CATEGORIES.map((cat) => (
          <button key={cat} id={`cat-${cat}`}
            onClick={() => setCategory(cat)}
            className="btn"
            style={{
              padding: '0.35rem 0.85rem', fontSize: '0.8rem',
              background: category === cat ? 'rgba(13,148,136,0.2)' : 'rgba(255,255,255,0.04)',
              color: category === cat ? '#14b8a6' : '#94a3b8',
              border: `1px solid ${category === cat ? 'rgba(13,148,136,0.4)' : 'rgba(255,255,255,0.07)'}`,
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="animate-spin" style={{
            width: 40, height: 40, border: '3px solid rgba(13,148,136,0.2)',
            borderTop: '3px solid #14b8a6', borderRadius: '50%' }} />
        </div>
      ) : topics.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</p>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            No topics yet — <Link to="/create-topic" style={{ color: '#14b8a6', fontWeight: 600 }}>be the first!</Link>
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {topics.map((topic) => <TopicCard key={topic._id} topic={topic} />)}
        </div>
      )}
    </div>
  );
}
