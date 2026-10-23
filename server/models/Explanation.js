const mongoose = require('mongoose');

const explanationSchema = new mongoose.Schema(
  {
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Explanation content is required'],
    },
    // Stores user IDs who upvoted — toggle logic in controller
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Explanation', explanationSchema);
