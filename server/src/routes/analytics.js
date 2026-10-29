const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics
// @desc    Get aggregate recruiter analytics for candidates and workflows
// @access  Private (Recruiter only)
router.get('/', protect, getAnalytics);

module.exports = router;
