import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe, getMyNotifications, markNotificationRead } from '../api/api';
import api from '../api/api';
import { PixelIcon, PixelStars } from '../components/Pixel';
import { AvatarPicker, AvatarDisplay } from '../components/AvatarPicker';

const ALL_SKILLS = ['Python', 'React', 'Node.js', 'Algorithms', 'Figma', 'Java', 'C++', 'ML/AI', 'Flutter', 'Data Science', 'Arduino', 'Research', 'Design', 'LLMs', 'Kotlin', 'Go', 'Rust', 'DevOps'];
const INTERESTS  = ['Hackathons', 'Research', 'Open Source', 'Startups', 'Sports', 'Music', 'Design', 'Competitive Programming', 'Web Dev', 'Mobile Dev'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate        = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    name:        user?.name        || '',
    department:  user?.department  || '',
    bio:         user?.bio         || '',
    year:        user?.year        || '',
    skills:      user?.skills      || [],
    lookingFor:  user?.lookingFor  || [],
    avatar:      user?.avatar      || 'doge',
  });

  const [notifications, setNotifications] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Sync if user changes
  useEffect(() => {
    if (user) {
      setForm({
        name:       user.name       || '',
        department: user.department || '',
        bio:        user.bio        || '',
        year:       user.year       || '',
        skills:     user.skills     || [],
        lookingFor: user.lookingFor || [],
        avatar:     user.avatar     || 'doge',
      });

      // Load user notifications
      setLoadingNotes(true);
      getMyNotifications()
        .then(res => setNotifications(res.data || []))
        .catch(console.error)
        .finally(() => setLoadingNotes(false));
    }
  }, [user]);

  const handleMarkRead = async (noteId) => {
    try {
      await markNotificationRead(noteId);
      setNotifications(prev => prev.map(n => n._id === noteId ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="page-main" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <PixelIcon name="user" size={48} style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontFamily: "'Pixelify Sans', monospace", marginBottom: '0.5rem' }}>Sign in to view your profile</h1>
        <Link to="/login" className="pixel-btn" style={{ background: 'var(--orange)', color: 'var(--cream)', marginTop: '1rem', display: 'inline-flex' }}>
          Log In
        </Link>
      </div>
    );
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const toggleSkill = (s, field) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(s) ? prev[field].filter(x => x !== s) : [...prev[field], s],
    }));
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data);
      setSuccess('Profile saved!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-main">
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'minmax(0,320px) 1fr' }}>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Avatar + name card */}
          <div className="pixel-card" style={{ overflow: 'hidden' }}>
            <div style={{ background: 'var(--navy)', height: 80, position: 'relative' }}>
              <PixelStars style={{ position: 'absolute', right: '1rem', top: '1rem' }} />
            </div>
            <div style={{ padding: '0 1.25rem 1.25rem', marginTop: '-2.5rem', position: 'relative' }}>
              <AvatarDisplay avatarId={editing ? form.avatar : (user.avatar || 'doge')} size={72} />
              {editing && (
                <div style={{ marginTop: '0.75rem' }}>
                  <AvatarPicker
                    selected={form.avatar}
                    onSelect={(id) => setForm(f => ({ ...f, avatar: id }))}
                  />
                </div>
              )}
              {editing ? (
                <input
                  className="input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ marginTop: '0.75rem', fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, fontSize: '1.2rem' }}
                />
              ) : (
                <h1 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.4rem', marginTop: '0.75rem' }}>{user.name}</h1>
              )}

              {editing ? (
                <input className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  placeholder="e.g. 2nd year" style={{ marginTop: '0.4rem' }} />
              ) : (
                <p style={{ color: 'var(--muted-fg)', marginTop: '0.2rem', fontSize: '0.9rem' }}>
                  {user.year && `${user.year} · `}{user.department}
                </p>
              )}

              {editing ? (
                <textarea className="input" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell others about yourself..." rows={3}
                  style={{ marginTop: '0.75rem', minHeight: 70 }} />
              ) : user.bio ? (
                <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--navy)' }}>{user.bio}</p>
              ) : editing ? null : (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--muted-fg)', fontStyle: 'italic' }}>No bio yet — click Edit profile</p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', padding: '0.35rem 0.65rem', background: 'var(--muted)', border: '2px solid var(--navy)', display: 'inline-flex', fontSize: '0.85rem' }}>
                <PixelIcon name="star" size={14} />
                <span style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700 }}>{user.reputation_pts || 0}</span>
                <span style={{ color: 'var(--muted-fg)', fontSize: '0.75rem' }}>rep pts</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {success && <div style={{ background: 'var(--mint-soft)', border: '2px solid var(--navy)', padding: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>✅ {success}</div>}
          {error   && <div style={{ background: 'oklch(0.93 0.05 27)', border: '2px solid var(--destructive)', padding: '0.75rem', fontSize: '0.875rem', color: 'var(--destructive)' }}>⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {editing ? (
              <>
                <button className="pixel-btn" onClick={handleSave} disabled={saving} style={{ flex: 1, background: 'var(--orange)', color: 'var(--cream)', justifyContent: 'center' }}>
                  {saving ? 'Saving…' : <><PixelIcon name="check" size={14} /> Save</>}
                </button>
                <button className="pixel-btn" onClick={() => { setEditing(false); setError(''); }} style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </>
            ) : (
              <button id="edit-profile-btn" className="pixel-btn" onClick={() => setEditing(true)} style={{ flex: 1, justifyContent: 'center' }}>
                <PixelIcon name="user" size={14} /> Edit Profile
              </button>
            )}
          </div>

          {/* Email + dept */}
          <div className="pixel-card-sm" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="label-pixel" style={{ color: 'var(--muted-fg)' }}>Email</div>
            <div style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{user.email}</div>
            <div className="label-pixel" style={{ color: 'var(--muted-fg)', marginTop: '0.5rem' }}>Department</div>
            {editing ? (
              <input className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Computer Science" />
            ) : (
              <div style={{ fontSize: '0.9rem' }}>{user.department || '—'}</div>
            )}
            <div className="label-pixel" style={{ color: 'var(--muted-fg)', marginTop: '0.5rem' }}>Role</div>
            <div style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{user.role}</div>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Skills section */}
          <section className="pixel-card-sm" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PixelIcon name="star" size={18} /> My Skills
            </h2>
            {editing ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {ALL_SKILLS.map(s => {
                  const active = form.skills.includes(s);
                  return (
                    <button key={s} onClick={() => toggleSkill(s, 'skills')}
                      style={{ border: '2px solid var(--navy)', padding: '0.25rem 0.65rem', borderRadius: 2, cursor: 'pointer', fontFamily: "'Silkscreen', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: active ? 'var(--mint)' : 'var(--card)', color: 'var(--navy)' }}>
                      {active && '✓ '}{s}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(user.skills || []).length > 0
                  ? (user.skills || []).map(s => <span key={s} className="skill-chip">{s}</span>)
                  : <p style={{ color: 'var(--muted-fg)', fontSize: '0.875rem' }}>No skills added yet. Click Edit Profile to add some.</p>}
              </div>
            )}
          </section>

          {/* Looking For section */}
          <section className="pixel-card-sm" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PixelIcon name="search" size={18} /> Looking For
            </h2>
            {editing ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {INTERESTS.map(s => {
                  const active = form.lookingFor.includes(s);
                  return (
                    <button key={s} onClick={() => toggleSkill(s, 'lookingFor')}
                      style={{ border: '2px solid var(--navy)', padding: '0.25rem 0.65rem', borderRadius: 2, cursor: 'pointer', fontFamily: "'Silkscreen', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: active ? 'var(--orange-soft)' : 'var(--card)', color: 'var(--navy)' }}>
                      {active && '✓ '}{s}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(user.lookingFor || []).length > 0
                  ? (user.lookingFor || []).map(s => <span key={s} className="badge badge-yellow">{s}</span>)
                  : <p style={{ color: 'var(--muted-fg)', fontSize: '0.875rem' }}>Add what you're looking for (hackathons, research, etc.)</p>}
              </div>
            )}
          </section>

          {/* Squad Invitations & Alerts Section */}
          <section className="pixel-card-sm" style={{ padding: '1.25rem', background: 'var(--cream)', border: '2px solid var(--navy)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--navy)' }}>
                <PixelIcon name="chat" size={18} /> Squad Invitations & Alerts
              </h2>
              {notifications.some(n => !n.read) && (
                <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
                  {notifications.filter(n => !n.read).length} New
                </span>
              )}
            </div>

            {loadingNotes ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid var(--mint-soft)', borderTop: '2px solid var(--navy)', borderRadius: '50%' }} />
              </div>
            ) : notifications.length === 0 ? (
              <p style={{ color: 'var(--muted-fg)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                No squad invitations or alerts yet. When activity organizers invite you to their squad, they will appear here!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {notifications.map(n => (
                  <div
                    key={n._id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: n.read ? 'var(--card)' : 'var(--mint-soft)',
                      border: n.read ? '1.5px solid var(--navy)' : '2px solid var(--orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <AvatarDisplay avatarId={n.sender?.avatar || 'doge'} size={36} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--navy)' }}>
                          {n.message}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-fg)' }}>
                          {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {n.activity?._id && (
                        <Link
                          to={`/activities/${n.activity._id}`}
                          onClick={() => handleMarkRead(n._id)}
                          className="pixel-btn"
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.3rem 0.65rem',
                            background: 'var(--orange-soft)',
                            color: 'var(--navy)',
                            textDecoration: 'none',
                          }}
                        >
                          View Squad →
                        </Link>
                      )}
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n._id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--navy)',
                            padding: '0.3rem 0.5rem',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            fontFamily: "'Silkscreen', monospace",
                          }}
                        >
                          ✓ Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick links */}
          <section className="pixel-card-sm" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Links</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {[
                { to: '/my-activity', label: 'My Activity', icon: 'activity', bg: 'var(--mint-soft)' },
                { to: '/saved',       label: 'Saved Posts', icon: 'bookmark', bg: 'var(--orange-soft)' },
                { to: '/topics',      label: 'Ask & Answer', icon: 'question', bg: 'var(--muted)' },
                { to: '/activities',  label: 'Find Teammates', icon: 'team', bg: 'var(--muted)' },
              ].map(l => (
                <Link key={l.to} to={l.to} className="pixel-card-sm card-hover" style={{ padding: '1rem', textDecoration: 'none', color: 'var(--navy)', background: l.bg, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <PixelIcon name={l.icon} size={18} />
                  <span style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '0.85rem', fontWeight: 600 }}>{l.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
