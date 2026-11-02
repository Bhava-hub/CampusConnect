const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Education email check (mirrors client-side)
const EDU_DOMAINS = ['.edu', '.ac.in', '.edu.in', 'university', 'college', 'inst.ac', 'iit.', 'nit.', 'iiit.'];
function isEducationEmail(email) {
  const lower = (email || '').toLowerCase();
  return EDU_DOMAINS.some(d => lower.includes(d));
}

// @desc  Register a new user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, department, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // ── Education email checkpoint ──────────────────────
    if (!isEducationEmail(email)) {
      return res.status(400).json({
        message: 'Only university/college email addresses are allowed (e.g. .edu, .ac.in)',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({
      name,
      email,
      password_hash: password,
      department: department || '',
      avatar: avatar || 'doge',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      avatar: user.avatar || 'doge',
      bio: user.bio,
      year: user.year,
      skills: user.skills,
      lookingFor: user.lookingFor,
      reputation_pts: user.reputation_pts,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      avatar: user.avatar || 'doge',
      bio: user.bio,
      year: user.year,
      skills: user.skills,
      lookingFor: user.lookingFor,
      reputation_pts: user.reputation_pts,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get logged-in user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc  Update logged-in user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, department, bio, year, skills, lookingFor, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name)        user.name       = name.trim();
    if (department !== undefined) user.department = department.trim();
    if (bio !== undefined)        user.bio        = bio.trim();
    if (year !== undefined)       user.year       = year.trim();
    if (skills)      user.skills     = skills;
    if (lookingFor)  user.lookingFor = lookingFor;
    if (avatar)      user.avatar     = avatar;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      avatar: user.avatar || 'doge',
      bio: user.bio,
      year: user.year,
      skills: user.skills,
      lookingFor: user.lookingFor,
      reputation_pts: user.reputation_pts,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get saved items for the logged-in user
// @route GET /api/auth/saved
const getSaved = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedTopics', 'title description category createdAt explanationCount user_id')
      .populate('savedActivities', 'title description status people_needed createdAt user_id skills');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      savedTopics:     user.savedTopics     || [],
      savedActivities: user.savedActivities || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Save a topic
// @route POST /api/auth/saved/topics/:topicId
const saveTopicItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedTopics.includes(req.params.topicId)) {
      user.savedTopics.push(req.params.topicId);
      await user.save();
    }
    res.json({ message: 'Topic saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Remove saved topic
// @route DELETE /api/auth/saved/topics/:topicId
const unsaveTopicItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedTopics = user.savedTopics.filter(id => id.toString() !== req.params.topicId);
    await user.save();
    res.json({ message: 'Topic removed from saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Save an activity
// @route POST /api/auth/saved/activities/:activityId
const saveActivityItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedActivities.includes(req.params.activityId)) {
      user.savedActivities.push(req.params.activityId);
      await user.save();
    }
    res.json({ message: 'Activity saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Remove saved activity
// @route DELETE /api/auth/saved/activities/:activityId
const unsaveActivityItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedActivities = user.savedActivities.filter(id => id.toString() !== req.params.activityId);
    await user.save();
    res.json({ message: 'Activity removed from saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all users (Admin only)
// @route GET /api/auth/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password_hash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a user account and their associated content (Admin only)
// @route DELETE /api/auth/users/:id
const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found' });

    if (userToDelete._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const Topic          = require('../models/Topic');
    const Activity       = require('../models/Activity');
    const ActivityMember = require('../models/ActivityMember');
    const Explanation    = require('../models/Explanation');

    await ActivityMember.deleteMany({ user_id: req.params.id });
    await Explanation.deleteMany({ user_id: req.params.id });
    await Topic.deleteMany({ user_id: req.params.id });
    await Activity.deleteMany({ user_id: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: `User account '${userToDelete.name}' and their content removed successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
