const mongoose = require('mongoose');

const activityMemberSchema = new mongoose.Schema(
  {
    activity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate memberships
activityMemberSchema.index({ activity_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('ActivityMember', activityMemberSchema);
