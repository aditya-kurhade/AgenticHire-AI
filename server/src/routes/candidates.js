const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  uploadCandidate,
  getCandidates,
  getCandidateById
} = require('../controllers/candidateController');

// @route   POST /api/candidates/upload
// @desc    Public route to upload a resume and apply for a job
// @access  Public
router.post('/upload', upload.single('resume'), uploadCandidate);

// @route   GET /api/candidates
// @desc    List all candidate applications (optionally filtered by jobId)
// @access  Private (Recruiter only)
router.get('/', protect, getCandidates);

// @route   GET /api/candidates/:id
// @desc    Get candidate details by ID
// @access  Private (Recruiter only)
router.get('/:id', protect, getCandidateById);

module.exports = router;
