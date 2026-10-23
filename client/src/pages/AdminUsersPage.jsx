import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const loadUsers = () => {
    setLoading(true);
    getAllUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to fetch users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${targetUser.name}' and all their posts?`)) {
      return;
    }
    setDeletingId(targetUser._id);
    setError('');
    setSuccess('');
    try {
      const res = await deleteUser(targetUser._id);
      setSuccess(res.data.message || 'User account removed');
      setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            🛡️ <span className="gradient-text">Admin User Management</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Manage campus accounts and remove inappropriate users or spam
          </p>
        </div>
        <span className="badge badge-purple" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
          Total Accounts: {users.length}
        </span>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px', padding: '0.75rem 1rem', color: '#4ade80', fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="animate-spin" style={{
            width: 40, height: 40, border: '3px solid rgba(124,58,237,0.2)',
            borderTop: '3px solid #a78bfa', borderRadius: '50%' }} />
        </div>
      ) : (
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Department</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Reputation</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentAdmin = u._id === user._id;
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: u.role === 'admin' ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'linear-gradient(135deg, #0d9488, #14b8a6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.85rem',
                          }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#f1f5f9' }}>
                              {u.name} {isCurrentAdmin && <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>You</span>}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                        {u.department || '—'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-teal'}`}>
                          {u.role === 'admin' ? '🛡️ Admin' : 'Student'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#14b8a6', fontWeight: 600 }}>
                        ★ {u.reputation_pts}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {!isCurrentAdmin && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteUser(u)}
                            disabled={deletingId === u._id}
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.775rem' }}
                          >
                            {deletingId === u._id ? 'Removing...' : '🗑️ Remove Account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
