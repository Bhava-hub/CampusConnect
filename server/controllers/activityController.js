const Activity = require('../models/Activity');
const ActivityMember = require('../models/ActivityMember');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc  Get all activities (open by default)
// @route GET /api/activities
const getActivities = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const activities = await Activity.find(query)
      .populate('user_id', 'name department avatar')
      .sort({ createdAt: -1 });

    // Add accepted member count and pending requests count to each activity
    const activitiesWithCount = await Promise.all(
      activities.map(async (activity) => {
        const memberCount = await ActivityMember.countDocuments({
          activity_id: activity._id,
          status: 'accepted',
        });
        const pendingCount = await ActivityMember.countDocuments({
          activity_id: activity._id,
          status: 'pending',
        });
        return { ...activity.toObject(), memberCount, pendingCount };
      })
    );

    res.json(activitiesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a new activity
// @route POST /api/activities
const createActivity = async (req, res) => {
  try {
    const { title, description, people_needed, category, skills, roles } = req.body;
    if (!title || !people_needed) {
      return res.status(400).json({ message: 'Title and people_needed are required' });
    }

    const activity = await Activity.create({
      user_id: req.user._id,
      title,
      description: description || '',
      category: category || 'General',
      skills: Array.isArray(skills) ? skills : [],
      roles: Array.isArray(roles) ? roles : [],
      people_needed: Number(people_needed) || 1,
    });

    const populated = await activity.populate('user_id', 'name department avatar');
    res.status(201).json({ ...populated.toObject(), memberCount: 0, pendingCount: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single activity with its members
// @route GET /api/activities/:id
const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate('user_id', 'name department avatar');
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const members = await ActivityMember.find({ activity_id: req.params.id }).populate(
      'user_id',
      'name department email avatar'
    );

    const acceptedCount = members.filter((m) => m.status === 'accepted').length;
    const pendingCount = members.filter((m) => m.status === 'pending').length;

    res.json({ activity, members, acceptedCount, pendingCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Join / volunteer for an activity
// @route POST /api/activities/:id/join
const joinActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    if (activity.status === 'closed') {
      return res.status(400).json({ message: 'Activity is already full' });
    }

    // Prevent creator from volunteering for their own activity
    if (activity.user_id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot volunteer for your own activity' });
    }

    // Check if already requested or joined
    const existing = await ActivityMember.findOne({
      activity_id: req.params.id,
      user_id: req.user._id,
    });

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'Your volunteer request is already pending approval' });
      }
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'You are already an accepted volunteer for this activity' });
      }
      // If previously rejected, allow re-applying as pending
      existing.status = 'pending';
      await existing.save();
      const populated = await existing.populate('user_id', 'name department email avatar');
      return res.json({
        message: 'Volunteer request re-submitted. Awaiting organizer approval.',
        member: populated,
      });
    }

    // Create volunteer request with 'pending' status
    const newMember = await ActivityMember.create({
      activity_id: req.params.id,
      user_id: req.user._id,
      status: 'pending',
    });

    const populated = await newMember.populate('user_id', 'name department email avatar');
    res.status(201).json({
      message: 'Volunteer request submitted! The poster can now review and accept your request.',
      member: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already requested or joined this activity' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc  Accept or reject a volunteer request (Creator or Admin only)
// @route PATCH /api/activities/:id/members/:memberId
const updateMemberStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'accepted' or 'rejected'" });
    }

    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    // Authorization: Only the creator of the activity can manage volunteers
    const isOwner = activity.user_id.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: 'Only the activity creator can accept or reject volunteers' });
    }

    const member = await ActivityMember.findOne({
      _id: req.params.memberId,
      activity_id: req.params.id,
    }).populate('user_id', 'name department email avatar');

    if (!member) {
      return res.status(404).json({ message: 'Volunteer request not found' });
    }

    const currentAccepted = await ActivityMember.countDocuments({
      activity_id: req.params.id,
      status: 'accepted',
    });

    if (status === 'accepted') {
      if (member.status !== 'accepted' && currentAccepted >= activity.people_needed) {
        return res.status(400).json({ message: 'Activity is already full! Cannot accept more volunteers.' });
      }

      member.status = 'accepted';
      await member.save();

      // Check if accepting this volunteer fills the requirement
      const newAcceptedCount = currentAccepted + (member.status === 'accepted' ? 1 : 0);
      if (newAcceptedCount >= activity.people_needed) {
        activity.status = 'closed';
        await activity.save();
      }
    } else if (status === 'rejected') {
      const wasAccepted = member.status === 'accepted';
      member.status = 'rejected';
      await member.save();

      // If they were previously accepted and activity was closed, reopen it
      if (wasAccepted && activity.status === 'closed') {
        activity.status = 'open';
        await activity.save();
      }
    }

    const acceptedCount = await ActivityMember.countDocuments({
      activity_id: req.params.id,
      status: 'accepted',
    });

    res.json({
      message: `Volunteer request ${status}`,
      member,
      activityStatus: activity.status,
      acceptedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Leave an activity or cancel volunteer request
// @route DELETE /api/activities/:id/leave
const leaveActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const membership = await ActivityMember.findOneAndDelete({
      activity_id: req.params.id,
      user_id: req.user._id,
    });
    if (!membership) {
      return res.status(400).json({ message: 'You have not joined or requested this activity' });
    }

    // Re-open if accepted member left and activity was closed
    if (membership.status === 'accepted' && activity.status === 'closed') {
      activity.status = 'open';
      await activity.save();
    }

    const memberCount = await ActivityMember.countDocuments({
      activity_id: req.params.id,
      status: 'accepted',
    });

    res.json({
      message: membership.status === 'pending' ? 'Volunteer request cancelled' : 'Left activity successfully',
      status: activity.status,
      memberCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete an activity (Admin or Activity Creator)
// @route DELETE /api/activities/:id
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const isCreator = activity.user_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this activity' });
    }

    // Delete associated memberships
    await ActivityMember.deleteMany({ activity_id: req.params.id });
    await Activity.findByIdAndDelete(req.params.id);

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get recommended teammates matching activity skills
// @route GET /api/activities/:id/recommendations
const getRecommendedTeammates = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const requiredSkills = (activity.skills || []).map(s => String(s).trim().toLowerCase());

    // Find users (excluding the activity creator)
    const users = await User.find({ _id: { $ne: activity.user_id } })
      .select('name email department avatar bio year skills lookingFor')
      .lean();

    // Score users based on skill overlap
    const scoredUsers = users.map(user => {
      const userSkills = (user.skills || []);
      const matched = userSkills.filter(s =>
        requiredSkills.includes(String(s).trim().toLowerCase())
      );
      return {
        ...user,
        matchedSkills: matched,
        matchCount: matched.length,
      };
    });

    // Filter STRICTLY by skill matches: only recommend users who have at least 1 matching skill
    let recommendations = [];
    if (requiredSkills.length > 0) {
      recommendations = scoredUsers
        .filter(u => u.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount);
    }

    res.json(recommendations.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Invite a student to squad
// @route POST /api/activities/:id/invite/:userId
const inviteToSquad = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    if (activity.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the activity organizer can send squad invitations' });
    }

    const recipient = await User.findById(req.params.userId);
    if (!recipient) return res.status(404).json({ message: 'Student not found' });

    // Check if notification already sent
    const existing = await Notification.findOne({
      recipient: recipient._id,
      activity: activity._id,
      sender: req.user._id,
      type: 'squad_invite',
    });

    if (existing) {
      return res.json({ message: `Invitation already sent to ${recipient.name}` });
    }

    await Notification.create({
      recipient: recipient._id,
      sender: req.user._id,
      activity: activity._id,
      type: 'squad_invite',
      message: `${req.user.name} invited you to join their squad: "${activity.title}"`,
    });

    res.status(201).json({ message: `Invitation successfully sent to ${recipient.name}!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get user notifications
// @route GET /api/activities/notifications/my
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name department avatar')
      .populate('activity', 'title category status')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Mark notification as read
// @route PATCH /api/activities/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};

