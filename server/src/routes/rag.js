const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  indexPolicyController,
  searchRagController,
  getPoliciesController,
  updatePolicyController,
  deletePolicyController,
  reindexPolicyController
} = require('../controllers/ragController');

// @route   GET /api/rag/policies
// @desc    Get all indexed policies
// @access  Private (Recruiter)
router.get('/policies', protect, getPoliciesController);

// @route   POST /api/rag/policies
// @desc    Index organizational hiring policy into Qdrant
// @access  Private (Recruiter)
router.post('/policies', protect, indexPolicyController);

// @route   PUT /api/rag/policies/:documentId
// @desc    Update and re-index hiring policy
// @access  Private (Recruiter)
router.put('/policies/:documentId', protect, updatePolicyController);

// @route   DELETE /api/rag/policies/:documentId
// @desc    Delete policy from Qdrant vector index and DB
// @access  Private (Recruiter)
router.delete('/policies/:documentId', protect, deletePolicyController);

// @route   POST /api/rag/policies/:documentId/reindex
// @desc    Re-index existing policy into Qdrant
// @access  Private (Recruiter)
router.post('/policies/:documentId/reindex', protect, reindexPolicyController);

// @route   POST /api/rag/search
// @desc    Semantic search across resumes or policies
// @access  Private (Recruiter)
router.post('/search', protect, searchRagController);

module.exports = router;

