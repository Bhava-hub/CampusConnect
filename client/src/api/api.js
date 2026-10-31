import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ─────────────────────────────────────────────
export const registerUser    = (data) => api.post('/auth/register', data);
export const loginUser       = (data) => api.post('/auth/login', data);
export const getMe           = ()     => api.get('/auth/me');
export const updateProfile   = (data) => api.put('/auth/profile', data);
export const getSaved        = ()     => api.get('/auth/saved');
export const saveTopic       = (id)   => api.post(`/auth/saved/topics/${id}`);
export const unsaveTopic     = (id)   => api.delete(`/auth/saved/topics/${id}`);
export const saveActivity    = (id)   => api.post(`/auth/saved/activities/${id}`);
export const unsaveActivity  = (id)   => api.delete(`/auth/saved/activities/${id}`);

// ── Topics (Explain It) ───────────────────────────────
export const getTopics      = (params) => api.get('/topics', { params });
export const createTopic    = (data)   => api.post('/topics', data);
export const getTopicById   = (id)     => api.get(`/topics/${id}`);
export const createExplain  = (id, data) => api.post(`/topics/${id}/explain`, data);
export const upvoteExplain  = (id)     => api.put(`/explanations/${id}/upvote`);
export const deleteExplanation = (id)  => api.delete(`/explanations/${id}`);
export const deleteTopic    = (id)     => api.delete(`/topics/${id}`);

// ── Activities (One More Person) ──────────────────────
export const getActivities    = (params) => api.get('/activities', { params });
export const createActivity   = (data)   => api.post('/activities', data);
export const getActivityById  = (id)     => api.get(`/activities/${id}`);
export const joinActivity         = (id)                        => api.post(`/activities/${id}/join`);
export const leaveActivity        = (id)                        => api.delete(`/activities/${id}/leave`);
export const updateMemberStatus   = (activityId, memberId, data) => api.patch(`/activities/${activityId}/members/${memberId}`, data);
export const deleteActivity       = (id)                        => api.delete(`/activities/${id}`);
export const getRecommendedTeammates = (id)                     => api.get(`/activities/${id}/recommendations`);
export const inviteToSquad         = (activityId, userId)        => api.post(`/activities/${activityId}/invite/${userId}`);
export const getMyNotifications    = ()                          => api.get('/activities/notifications/my');
export const markNotificationRead  = (id)                        => api.patch(`/activities/notifications/${id}/read`);

// ── Admin ─────────────────────────────────────────────
export const getAllUsers = ()       => api.get('/auth/users');
export const deleteUser  = (userId) => api.delete(`/auth/users/${userId}`);

export default api;
