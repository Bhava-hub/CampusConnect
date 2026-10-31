const express = require('express');
const router = express.Router();
const {
  getActivities,
  createActivity,
  getActivityById,
  joinActivity,
  updateMemberStatus,
  leaveActivity,
  deleteActivity,
  getRecommendedTeammates,
  inviteToSquad,
  getMyNotifications,
  markNotificationRead,
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.route('/').get(getActivities).post(protect, createActivity);
router.route('/notifications/my').get(protect, getMyNotifications);
router.route('/notifications/:id/read').patch(protect, markNotificationRead);
router.route('/:id').get(getActivityById).delete(protect, deleteActivity);
router.route('/:id/recommendations').get(protect, getRecommendedTeammates);
router.route('/:id/invite/:userId').post(protect, inviteToSquad);
router.route('/:id/join').post(protect, joinActivity);
router.route('/:id/leave').delete(protect, leaveActivity);
router.route('/:id/members/:memberId').patch(protect, updateMemberStatus);

module.exports = router;
