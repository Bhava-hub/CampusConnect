import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getActivityById, joinActivity, leaveActivity, updateMemberStatus, deleteActivity } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function ActivityDetailPage() {
  const { id }                = useParams();
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const loadActivity = () => {
    return getActivityById(id)
      .then((res) => setData(res.data))
      .catch(() => navigate('/activities'));
  };

  useEffect(() => {
    loadActivity().finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="animate-spin" style={{
        width: 40, height: 40, border: '3px solid rgba(124,58,237,0.2)',
        borderTop: '3px solid #a78bfa', borderRadius: '50%' }} />
    </div>
  );

  const { activity, members = [] } = data;
  const isOwner = user && activity.user_id?._id === user._id;
  const canDelete = user && (isOwner || user.role === 'admin');
  const myMembership = user && members.find((m) => m.user_id?._id === user._id);

  const acceptedMembers = members.filter((m) => m.status === 'accepted');
  const pendingMembers  = members.filter((m) => m.status === 'pending');
  const rejectedMembers = members.filter((m) => m.status === 'rejected');

  const isFull  = activity.status === 'closed' || acceptedMembers.length >= activity.people_needed;
  const percent = Math.min((acceptedMembers.length / activity.people_needed) * 100, 100);

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

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/activities" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          ← Back to Activities
        </Link>
        {canDelete && (
          <button
            className="btn btn-danger"
            onClick={handleDeleteActivity}
            disabled={deleting}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.825rem' }}
          >
            {deleting ? 'Deleting...' : user.role === 'admin' && !isOwner ? '🗑️ Admin Delete Post' : '🗑️ Delete Post'}
          </button>
        )}
      </div>

      {/* Activity detail card */}
      <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={`badge ${isFull ? 'badge-red' : 'badge-green'}`}>
              {isFull ? '🔴 Full' : '🟢 Open for volunteers'}
            </span>
            {user?.role === 'admin' && (
              <span className="badge badge-purple">🛡️ Admin</span>
            )}
          </div>
          <span style={{ color: '#64748b', fontSize: '0.825rem' }}>
            Posted by <strong style={{ color: '#cbd5e1' }}>{activity.user_id?.name}</strong>
            {activity.user_id?.department && ` · ${activity.user_id.department}`}
          </span>
        </div>

        <h1 style={{ fontSize: '1.65rem', marginBottom: '0.75rem', lineHeight: 1.35 }}>{activity.title}</h1>
        {activity.description && (
          <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.25rem' }}>{activity.description}</p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Accepted Volunteers</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isFull ? '#f87171' : '#4ade80' }}>
              {acceptedMembers.length} / {activity.people_needed}
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.07)' }}>
            <div style={{
              height: '100%', borderRadius: 999, width: `${percent}%`,
              background: isFull ? 'linear-gradient(90deg,#ef4444,#f87171)' : 'linear-gradient(90deg,#7c3aed,#a78bfa)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.875rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px', padding: '0.75rem 1rem', color: '#4ade80', fontSize: '0.875rem',
            marginBottom: '1rem',
          }}>
            {success}
          </div>
        )}

        {/* Action button area */}
        <div>
          {!user ? (
            <Link to="/login" className="btn btn-purple">Sign in to Volunteer</Link>
          ) : isOwner ? (
            <div style={{
              background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.25)',
              borderRadius: '10px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <div>
                <p style={{ fontWeight: 600, color: '#c4b5fd', fontSize: '0.9rem' }}>
                  🎯 You are the Organizer of this activity
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  Review and accept volunteer requests in the list below.
                </p>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                {pendingMembers.length} Pending {pendingMembers.length === 1 ? 'Request' : 'Requests'}
              </span>
            </div>
          ) : myMembership?.status === 'accepted' ? (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
              background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '10px', padding: '0.85rem 1.25rem',
            }}>
              <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>
                🎉 You are an accepted volunteer for this activity!
              </span>
              <button id="leave-btn" className="btn btn-danger" onClick={handleLeave} disabled={acting}>
                {acting ? 'Leaving...' : '✖ Leave Activity'}
              </button>
            </div>
          ) : myMembership?.status === 'pending' ? (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
              background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)',
              borderRadius: '10px', padding: '0.85rem 1.25rem',
            }}>
              <span style={{ color: '#facc15', fontWeight: 600, fontSize: '0.9rem' }}>
                ⏳ Your volunteer request is pending organizer approval
              </span>
              <button id="cancel-request-btn" className="btn btn-danger" onClick={handleLeave} disabled={acting}>
                {acting ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          ) : myMembership?.status === 'rejected' ? (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px', padding: '0.85rem 1.25rem',
            }}>
              <span style={{ color: '#f87171', fontWeight: 500, fontSize: '0.9rem' }}>
                Your previous volunteer request was declined.
              </span>
              <button id="reapply-btn" className="btn btn-purple" onClick={handleJoin} disabled={acting || isFull}>
                {acting ? 'Submitting...' : isFull ? 'Activity Full' : 'Re-apply to Volunteer'}
              </button>
            </div>
          ) : (
            <button id="join-btn" className="btn btn-purple" onClick={handleJoin}
              disabled={acting || isFull}>
              {acting ? 'Sending Request...' : isFull ? 'Activity Full' : '🙋 Volunteer to Join'}
            </button>
          )}
        </div>
      </div>

      {/* Pending Volunteers for Organizer / Admin */}
      {isOwner && pendingMembers.length > 0 && (
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#facc15', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⏳ Pending Volunteer Requests ({pendingMembers.length})
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {activity.people_needed - acceptedMembers.length} spot(s) remaining
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingMembers.map((m) => (
              <div key={m._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.85rem',
                  }}>
                    {m.user_id?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9' }}>{m.user_id?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {m.user_id?.department || 'No department'} {m.user_id?.email && ` · ${m.user_id.email}`}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                    onClick={() => handleUpdateStatus(m._id, 'accepted')}
                    disabled={actionId === m._id || isFull}
                  >
                    {actionId === m._id ? 'Saving...' : '✓ Accept'}
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
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
      <div className="glass" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          👥 Accepted Volunteers ({acceptedMembers.length} / {activity.people_needed})
        </h2>

        {acceptedMembers.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>
            No volunteers accepted yet. When volunteers apply, the organizer can accept them here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {acceptedMembers.map((m) => (
              <div key={m._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #0d9488)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.85rem',
                  }}>
                    {m.user_id?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0' }}>
                      {m.user_id?.name}
                      {m.user_id?._id === user?._id && (
                        <span className="badge badge-teal" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>You</span>
                      )}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {m.user_id?.department || 'Student'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-green">✓ Accepted</span>
                  {isOwner && m.user_id?._id !== user?._id && (
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
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

