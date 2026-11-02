import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getActivityById,
  joinActivity,
  leaveActivity,
  updateMemberStatus,
  deleteActivity,
  getRecommendedTeammates,
  inviteToSquad,
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import { AvatarDisplay } from '../components/AvatarPicker';
import { PixelIcon, PixelStars } from '../components/Pixel';

export default function ActivityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [invited, setInvited] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadActivity = () => {
    return getActivityById(id)
      .then((res) => {
        setData(res.data);
      })
      .catch(() => navigate('/activities'));
  };

  const loadRecommendations = () => {
    if (!user) return;
    getRecommendedTeammates(id)
      .then((res) => setRecommendations(res.data || []))
      .catch((err) => console.error('Failed to load recommendations:', err));
  };

  useEffect(() => {
    loadActivity().finally(() => setLoading(false));
    loadRecommendations();
  }, [id, user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{
          width: 40, height: 40, border: '3px solid var(--mint-soft)',
          borderTop: '3px solid var(--navy)', borderRadius: '50%',
        }} />
      </div>
    );
  }

  const { activity, members = [] } = data;
  const isOwner = user && (activity.user_id?._id === user._id || activity.user_id === user._id);
  const canDelete = user && (isOwner || user.role === 'admin');
  const myMembership = user && members.find((m) => (m.user_id?._id === user._id || m.user_id === user._id));

  const acceptedMembers = members.filter((m) => m.status === 'accepted');
  const pendingMembers = members.filter((m) => m.status === 'pending');

  const isFull = activity.status === 'closed' || acceptedMembers.length >= activity.people_needed;
  const percent = Math.min((acceptedMembers.length / (activity.people_needed || 1)) * 100, 100);

  const handleDeleteActivity = async () => {
    if (!window.confirm('Are you sure you want to delete this activity? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteActivity(id);
      navigate('/activities');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete activity');
      setDeleting(false);
    }
  };

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return; }
    setActing(true); setError(''); setSuccess('');
    try {
      const res = await joinActivity(id);
      setSuccess(res.data.message || 'Volunteer request sent!');
      await loadActivity();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join');
    } finally {
      setActing(false);
    }
  };

  const handleLeave = async () => {
    setActing(true); setError(''); setSuccess('');
    try {
      const res = await leaveActivity(id);
      setSuccess(res.data.message || 'Updated successfully');
      await loadActivity();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not leave');
    } finally {
      setActing(false);
    }
  };

  const handleUpdateStatus = async (memberId, status) => {
    setActionId(memberId); setError(''); setSuccess('');
    try {
      const res = await updateMemberStatus(id, memberId, { status });
      setSuccess(res.data.message || `Volunteer request ${status}`);
      await loadActivity();
    } catch (err) {
      setError(err.response?.data?.message || `Could not mark as ${status}`);
    } finally {
      setActionId(null);
    }
  };

  const handleInvite = async (student) => {
    try {
      const res = await inviteToSquad(id, student._id);
      setInvited(prev => ({ ...prev, [student._id]: true }));
      setSuccess(res.data.message || `Squad invite sent to ${student.name}!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send squad invite');
    }
  };

  return (
    <div className="page-main" style={{ maxWidth: '840px' }}>
      {/* Top back navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/activities" style={{ color: 'var(--navy)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: "'Pixelify Sans', monospace", fontWeight: 600 }}>
          ← Back to Teammate Search
        </Link>
        {canDelete && (
          <button
            className="pixel-btn"
            onClick={handleDeleteActivity}
            disabled={deleting}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'var(--orange-soft)', color: 'var(--destructive)', border: '2px solid var(--navy)' }}
          >
            {deleting ? 'Deleting...' : user.role === 'admin' && !isOwner ? '🗑️ Admin Delete' : '🗑️ Delete Post'}
          </button>
        )}
      </div>

      {/* Main Activity Details Card */}
      <div className="pixel-card" style={{ padding: '2rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={`badge ${isFull ? 'badge-red' : 'badge-teal'}`}>
              {isFull ? 'Full' : 'Open for Teammates'}
            </span>
            {activity.category && (
              <span className="badge badge-purple">{activity.category}</span>
            )}
            {user?.role === 'admin' && (
              <span className="badge badge-purple">🛡️ Admin</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <AvatarDisplay avatarId={activity.user_id?.avatar || 'doge'} size={24} />
            <span style={{ color: 'var(--muted-fg)' }}>
              Posted by <strong style={{ color: 'var(--navy)' }}>{activity.user_id?.name || 'Anonymous'}</strong>
              {activity.user_id?.department && ` · ${activity.user_id.department}`}
            </span>
          </div>
        </div>

        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.75rem', lineHeight: 1.25 }}>{activity.title}</h1>
        {activity.description && (
          <p style={{ color: 'var(--muted-fg)', lineHeight: 1.6, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            {activity.description}
          </p>
        )}

        {/* Required Skills Section */}
        {activity.skills && activity.skills.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--navy)' }}>
              Skills Needed:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {activity.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'var(--mint-soft)',
                    border: '1.5px solid var(--navy)',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.78rem',
                    fontFamily: "'Silkscreen', monospace",
                    color: 'var(--navy)',
                  }}
                >
                  <PixelIcon name="star" size={11} /> {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roles Available Section */}
        {activity.roles && activity.roles.length > 0 && (
          <div style={{
            background: 'var(--cream)',
            border: '2px solid var(--navy)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PixelIcon name="team" size={14} /> Open Roles Available:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              {activity.roles.map((r, i) => (
                <div key={i} style={{
                  background: 'var(--card)',
                  border: '1.5px solid var(--navy)',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.name}</span>
                  <span style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, fontSize: '0.8rem', background: 'var(--orange-soft)', padding: '0.1rem 0.4rem', border: '1px solid var(--navy)' }}>
                    {r.open} {r.open === 1 ? 'seat' : 'seats'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Headcount Progress bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--muted-fg)' }}>Accepted Teammates</span>
            <span style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, color: isFull ? 'var(--orange)' : 'var(--navy)' }}>
              {acceptedMembers.length} / {activity.people_needed}
            </span>
          </div>
          <div style={{ height: 10, border: '2px solid var(--navy)', background: 'var(--cream)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${percent}%`,
              background: isFull ? 'var(--orange)' : 'var(--mint)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)', border: '2px solid var(--destructive)',
            padding: '0.75rem 1rem', color: 'var(--destructive)', fontSize: '0.875rem',
            marginBottom: '1rem', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'var(--mint-soft)', border: '2px solid var(--navy)',
            padding: '0.75rem 1rem', color: 'var(--navy)', fontSize: '0.875rem',
            marginBottom: '1rem', fontWeight: 600,
          }}>
            {success}
          </div>
        )}

        {/* Action button area */}
        <div>
          {!user ? (
            <Link to="/login" className="pixel-btn pixel-btn-orange">Sign in to Join Squad</Link>
          ) : isOwner ? (
            <div style={{
              background: 'var(--mint-soft)', border: '2px solid var(--navy)',
              padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <div>
                <p style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>
                  🎯 You are the Organizer of this squad
                </p>
                <p style={{ color: 'var(--muted-fg)', fontSize: '0.8rem' }}>
                  Review and accept volunteer requests in the list below.
                </p>
              </div>
              <span className="badge badge-teal" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                {pendingMembers.length} Pending {pendingMembers.length === 1 ? 'Request' : 'Requests'}
              </span>
            </div>
          ) : myMembership?.status === 'accepted' ? (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
              background: 'var(--mint-soft)', border: '2px solid var(--navy)',
              padding: '0.85rem 1.25rem',
            }}>
              <span style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.9rem' }}>
                🎉 You are an accepted member of this squad!
              </span>
              <button id="leave-btn" className="pixel-btn" onClick={handleLeave} disabled={acting} style={{ background: 'var(--orange-soft)' }}>
                {acting ? 'Leaving...' : '✖ Leave Squad'}
              </button>
            </div>
          ) : myMembership?.status === 'pending' ? (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
              background: 'var(--orange-soft)', border: '2px solid var(--navy)',
              padding: '0.85rem 1.25rem',
            }}>
              <span style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.9rem' }}>
                ⏳ Your request is pending organizer approval
              </span>
              <button id="cancel-request-btn" className="pixel-btn" onClick={handleLeave} disabled={acting} style={{ background: 'var(--card)' }}>
                {acting ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          ) : (
            <button id="join-btn" className="pixel-btn pixel-btn-orange" onClick={handleJoin}
              disabled={acting || isFull} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              <PixelIcon name="heart" size={16} />
              {acting ? 'Sending Request...' : isFull ? 'Squad Full' : 'Express Interest & Join Squad'}
            </button>
          )}
        </div>
      </div>

      {/* ── RECOMMENDED TEAMMATES SECTION (Only for Activity Organizer) ── */}
      {isOwner && (
        <section style={{ marginBottom: '1.75rem' }}>
          <div className="pixel-card" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            <PixelStars style={{ position: 'absolute', right: '1.25rem', top: '1.25rem' }} />
            <div className="label-pixel" style={{ color: 'var(--orange)', marginBottom: '0.3rem' }}>Skill Match Engine</div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem', color: 'var(--navy)' }}>
              Recommended Teammates For You
            </h2>
            <p style={{ color: 'var(--muted-fg)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Classmates who have listed skills that match your needed skills for this activity:
            </p>

          {recommendations.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              border: '2px dashed var(--navy)',
              background: 'var(--cream)',
            }}>
              <PixelIcon name="search" size={28} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ color: 'var(--muted-fg)', fontSize: '0.9rem' }}>
                No direct skill matches found among classmates yet. As peers update their profile skills, they will appear here!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {recommendations.map((student) => {
                const hasInvited = !!invited[student._id];
                return (
                  <div
                    key={student._id}
                    className="pixel-card-sm"
                    style={{
                      padding: '1.1rem',
                      background: 'var(--card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      border: student.matchCount > 0 ? '2px solid var(--orange)' : '2px solid var(--navy)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <AvatarDisplay avatarId={student.avatar || 'doge'} size={44} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {student.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted-fg)' }}>
                          {student.year ? `${student.year} · ` : ''}{student.department || 'Student'}
                        </div>
                      </div>
                    </div>

                    {student.matchedSkills && student.matchedSkills.length > 0 ? (
                      <div>
                        <span style={{ fontSize: '0.72rem', fontFamily: "'Silkscreen', monospace", color: 'var(--orange)', fontWeight: 700 }}>
                          ★ {student.matchedSkills.length} SKILL {student.matchedSkills.length === 1 ? 'MATCH' : 'MATCHES'}:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                          {student.matchedSkills.map(sk => (
                            <span key={sk} style={{
                              fontSize: '0.72rem',
                              fontFamily: "'Silkscreen', monospace",
                              background: 'var(--mint)',
                              color: 'var(--navy)',
                              border: '1px solid var(--navy)',
                              padding: '0.1rem 0.4rem',
                              fontWeight: 700,
                            }}>
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      student.skills && student.skills.length > 0 && (
                        <div>
                          <span style={{ fontSize: '0.72rem', fontFamily: "'Silkscreen', monospace", color: 'var(--muted-fg)' }}>
                            Skills:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                            {student.skills.slice(0, 3).map(sk => (
                              <span key={sk} style={{
                                fontSize: '0.72rem',
                                fontFamily: "'Silkscreen', monospace",
                                background: 'var(--cream)',
                                color: 'var(--navy)',
                                border: '1px solid var(--navy)',
                                padding: '0.1rem 0.35rem',
                              }}>
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}

                    {student.bio && (
                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--muted-fg)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                      }}>
                        "{student.bio}"
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleInvite(student)}
                        disabled={hasInvited}
                        className="pixel-btn"
                        style={{
                          flex: 1,
                          fontSize: '0.78rem',
                          padding: '0.4rem 0.6rem',
                          background: hasInvited ? 'var(--mint)' : 'var(--orange-soft)',
                          justifyContent: 'center',
                          color: 'var(--navy)',
                        }}
                      >
                        {hasInvited ? '✓ Invite Sent' : '+ Invite to Squad'}
                      </button>
                      {student.email && (
                        <a
                          href={`mailto:${student.email}?subject=Invitation to join ${encodeURIComponent(activity.title)}`}
                          className="pixel-btn"
                          title={`Email ${student.email}`}
                          style={{ padding: '0.4rem 0.6rem', background: 'var(--card)', color: 'var(--navy)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                        >
                          ✉
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Pending Volunteer Requests for Organizer */}
      {isOwner && pendingMembers.length > 0 && (
        <div className="pixel-card" style={{ padding: '1.5rem', marginBottom: '1.75rem', background: 'var(--orange-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--navy)' }}>
              <PixelIcon name="team" size={18} /> Pending Volunteer Requests ({pendingMembers.length})
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted-fg)' }}>
              {(activity.people_needed || 1) - acceptedMembers.length} spot(s) remaining
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingMembers.map((m) => (
              <div key={m._id} className="pixel-card-sm" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.85rem 1rem', background: 'var(--card)', flexWrap: 'wrap', gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AvatarDisplay avatarId={m.user_id?.avatar || 'doge'} size={36} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--navy)' }}>{m.user_id?.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted-fg)' }}>
                      {m.user_id?.department || 'No department'} {m.user_id?.email && ` · ${m.user_id.email}`}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="pixel-btn pixel-btn-mint"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                    onClick={() => handleUpdateStatus(m._id, 'accepted')}
                    disabled={actionId === m._id || isFull}
                  >
                    {actionId === m._id ? 'Saving...' : '✓ Accept'}
                  </button>
                  <button
                    className="pixel-btn"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem', background: 'var(--card)' }}
                    onClick={() => handleUpdateStatus(m._id, 'rejected')}
                    disabled={actionId === m._id}
                  >
                    ✕ Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Members list */}
      <div className="pixel-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PixelIcon name="team" size={18} /> Accepted Volunteers ({acceptedMembers.length} / {activity.people_needed})
        </h2>

        {acceptedMembers.length === 0 ? (
          <p style={{ color: 'var(--muted-fg)', fontSize: '0.875rem', fontStyle: 'italic' }}>
            No volunteers accepted yet. When peers apply, you can review and accept them here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {acceptedMembers.map((m) => (
              <div key={m._id} className="pixel-card-sm" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', background: 'var(--card)', flexWrap: 'wrap', gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AvatarDisplay avatarId={m.user_id?.avatar || 'doge'} size={34} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)' }}>
                      {m.user_id?.name}
                      {(m.user_id?._id === user?._id || m.user_id === user?._id) && (
                        <span className="badge badge-teal" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>You</span>
                      )}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-fg)' }}>
                      {m.user_id?.department || 'Student'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-teal">✓ Accepted</span>
                  {isOwner && (m.user_id?._id !== user?._id && m.user_id !== user?._id) && (
                    <button
                      className="pixel-btn"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'var(--orange-soft)' }}
                      onClick={() => handleUpdateStatus(m._id, 'rejected')}
                      disabled={actionId === m._id}
                      title="Remove volunteer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
