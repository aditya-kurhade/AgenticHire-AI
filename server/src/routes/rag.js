const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  indexPolicyController,
  searchRagController
} = require('../controllers/ragController');

// @route   POST /api/rag/policies
// @desc    Index organizational hiring policy into Qdrant
// @access  Private (Recruiter)
router.post('/policies', protect, indexPolicyController);

// @route   POST /api/rag/search
// @desc    Semantic search across resumes or policies
// @access  Private (Recruiter)
router.post('/search', protect, searchRagController);

module.exports = router;

