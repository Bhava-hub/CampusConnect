const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getSaved,
  saveTopicItem,
  unsaveTopicItem,
  saveActivityItem,
  unsaveActivityItem,
  getAllUsers,
  deleteUser,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Saved items
router.get('/saved', protect, getSaved);
router.post('/saved/topics/:topicId', protect, saveTopicItem);
router.delete('/saved/topics/:topicId', protect, unsaveTopicItem);
router.post('/saved/activities/:activityId', protect, saveActivityItem);
router.delete('/saved/activities/:activityId', protect, unsaveActivityItem);

// Admin routes
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
