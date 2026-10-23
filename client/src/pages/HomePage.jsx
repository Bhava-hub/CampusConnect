import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
      }}>
        {/* Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.25)',
          borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
          <span style={{ color: '#14b8a6', fontSize: '0.8rem', fontWeight: 600 }}>
            🎓 OUR SOLUTION
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.15, marginBottom: '1.5rem' }}>
          <span className="gradient-text">CampusConnect</span>
          <br />
          <span style={{ color: '#e2e8f0' }}>one app, two superpowers</span>
        </h1>

        <p style={{ maxWidth: '600px', margin: '0 auto 2.5rem', color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.7 }}>
          A lightweight social layer for campus life — get your doubts explained by peers
          and find teammates for any activity instantly.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/topics"     className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            🧠 Explain It
          </Link>
          <Link to="/activities" className="btn btn-purple" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            👥 One More Person
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 5rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Explain It */}
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', marginBottom: '1.25rem',
            boxShadow: '0 0 20px rgba(13,148,136,0.4)' }}>
            🧠
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.35rem', color: '#f1f5f9' }}>Explain It</h2>
          <p style={{ color: '#14b8a6', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
            PEER DOUBT-SOLVING
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Post any topic you don\'t understand',
              'Peers answer in simple, ELI5-style language',
              'Community upvotes surface the clearest explanation',
              'Builds a searchable knowledge feed over time',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                <span style={{ color: '#14b8a6', marginTop: '0.1rem' }}>●</span>
                {item}
              </li>
            ))}
          </ul>
          <Link to="/topics" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Browse Topics →
          </Link>
        </div>

        {/* One More Person */}
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', marginBottom: '1.25rem',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            👥
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.35rem', color: '#f1f5f9' }}>One More Person</h2>
          <p style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
            INSTANT GROUP-BUILDING
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Post an activity and how many people you need',
              '"2 more for badminton" or "1 teammate for hackathon"',
              'Interested students join instantly, no back-and-forth',
              'Auto-closes once the headcount is filled',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                <span style={{ color: '#a78bfa', marginTop: '0.1rem' }}>●</span>
                {item}
              </li>
            ))}
          </ul>
          <Link to="/activities" className="btn btn-purple" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Find Activities →
          </Link>
        </div>
      </section>
    </div>
  );
}
