const express = require('express');
const router = express.Router();
const { getTopics, createTopic, getTopicById, deleteTopic } = require('../controllers/topicController');
const { createExplanation } = require('../controllers/explanationController');
const { protect } = require('../middleware/auth');

router.route('/').get(getTopics).post(protect, createTopic);
router.route('/:id').get(getTopicById).delete(protect, deleteTopic);
router.route('/:id/explain').post(protect, createExplanation);

module.exports = router;
