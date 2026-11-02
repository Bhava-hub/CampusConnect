const Explanation = require('../models/Explanation');
const Topic = require('../models/Topic');
const User = require('../models/User');

// @desc  Post an explanation for a topic
// @route POST /api/topics/:id/explain
const createExplanation = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const explanation = await Explanation.create({
      topic_id: req.params.id,
      user_id: req.user._id,
      content,
    });

    const populated = await explanation.populate('user_id', 'name department reputation_pts avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Toggle upvote on an explanation
// @route PUT /api/explanations/:id/upvote
const upvoteExplanation = async (req, res) => {
  try {
    const explanation = await Explanation.findById(req.params.id);
    if (!explanation) return res.status(404).json({ message: 'Explanation not found' });

    const userId = req.user._id;
    const alreadyUpvoted = explanation.upvotes.includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote
      explanation.upvotes = explanation.upvotes.filter((id) => id.toString() !== userId.toString());
      await explanation.save();

      // Decrease author reputation
      await User.findByIdAndUpdate(explanation.user_id, { $inc: { reputation_pts: -1 } });
    } else {
      // Add upvote
      explanation.upvotes.push(userId);
      await explanation.save();

      // Increase author reputation
      await User.findByIdAndUpdate(explanation.user_id, { $inc: { reputation_pts: 1 } });
    }

    const populated = await explanation.populate('user_id', 'name department reputation_pts avatar');
    res.json({ ...populated.toObject(), upvoted: !alreadyUpvoted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete an explanation (Admin or Author)
// @route DELETE /api/explanations/:id
const deleteExplanation = async (req, res) => {
  try {
    const explanation = await Explanation.findById(req.params.id);
    if (!explanation) return res.status(404).json({ message: 'Explanation not found' });

    const isAuthor = explanation.user_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this explanation' });
    }

    await Explanation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Explanation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createExplanation, upvoteExplanation, deleteExplanation };
