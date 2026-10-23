const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Topic', topicSchema);
