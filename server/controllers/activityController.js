const Activity = require('../models/Activity');
const ActivityMember = require('../models/ActivityMember');

// @desc  Get all activities (open by default)
// @route GET /api/activities
const getActivities = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const activities = await Activity.find(query)
      .populate('user_id', 'name department')
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
    const { title, description, people_needed } = req.body;
    if (!title || !people_needed) {
      return res.status(400).json({ message: 'Title and people_needed are required' });
    }

    const activity = await Activity.create({
      user_id: req.user._id,
      title,
      description: description || '',
      people_needed,
    });

    const populated = await activity.populate('user_id', 'name department');
    res.status(201).json({ ...populated.toObject(), memberCount: 0, pendingCount: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single activity with its members
// @route GET /api/activities/:id
const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate('user_id', 'name department');
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const members = await ActivityMember.find({ activity_id: req.params.id }).populate(
      'user_id',
      'name department email'
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
      const populated = await existing.populate('user_id', 'name department email');
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

    const populated = await newMember.populate('user_id', 'name department email');
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
    }).populate('user_id', 'name department email');

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

module.exports = {
  getActivities,
  createActivity,
  getActivityById,
  joinActivity,
  updateMemberStatus,
  leaveActivity,
  deleteActivity,
};

