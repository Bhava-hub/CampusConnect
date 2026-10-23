const Topic = require('../models/Topic');
const Explanation = require('../models/Explanation');

// @desc  Get all topics (with optional search/category filter)
// @route GET /api/topics
const getTopics = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const topics = await Topic.find(query)
      .populate('user_id', 'name department')
      .sort({ createdAt: -1 });

    // Add explanation count to each topic
    const topicsWithCount = await Promise.all(
      topics.map(async (topic) => {
        const count = await Explanation.countDocuments({ topic_id: topic._id });
        return { ...topic.toObject(), explanationCount: count };
      })
    );

    res.json(topicsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a new topic
// @route POST /api/topics
const createTopic = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const topic = await Topic.create({
      user_id: req.user._id,
      title,
      description,
      category: category || 'General',
    });

    const populated = await topic.populate('user_id', 'name department');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single topic with its explanations sorted by upvote count
// @route GET /api/topics/:id
const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('user_id', 'name department');
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const explanations = await Explanation.find({ topic_id: req.params.id })
      .populate('user_id', 'name department reputation_pts')
      .lean();

    // Sort explanations by upvote count descending
    explanations.sort((a, b) => b.upvotes.length - a.upvotes.length);

    res.json({ topic, explanations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a topic (Admin or Topic Creator)
// @route DELETE /api/topics/:id
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const isCreator = topic.user_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this topic' });
    }

    // Delete all associated explanations
    await Explanation.deleteMany({ topic_id: req.params.id });
    await Topic.findByIdAndDelete(req.params.id);

    res.json({ message: 'Topic and its explanations deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTopics, createTopic, getTopicById, deleteTopic };
