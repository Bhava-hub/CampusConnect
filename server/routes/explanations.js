const express = require('express');
const router = express.Router();
const { upvoteExplanation, deleteExplanation } = require('../controllers/explanationController');
const { protect } = require('../middleware/auth');

router.route('/:id/upvote').put(protect, upvoteExplanation);
router.route('/:id').delete(protect, deleteExplanation);

module.exports = router;
