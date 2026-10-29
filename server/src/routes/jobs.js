const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { validateJob } = require('../middleware/validators');

// @route   POST /api/jobs
// @desc    Create a new job specification
// @access  Private (Recruiter only)
router.post('/', protect, validateJob, createJob);

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', getJobs);

// @route   GET /api/jobs/:id
// @desc    Get a single job specification by ID
// @access  Public
router.get('/:id', getJobById);

// @route   PUT /api/jobs/:id
// @desc    Update a job specification
// @access  Private (Recruiter only)
router.put('/:id', protect, validateJob, updateJob);

module.exports = router;
