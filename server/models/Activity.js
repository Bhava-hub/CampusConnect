const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    open: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    skills: {
      type: [String],
      default: [],
    },
    roles: {
      type: [roleSchema],
      default: [],
    },
    people_needed: {
      type: Number,
      required: [true, 'Number of people needed is required'],
      min: 1,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
