const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');
const { validateJob } = require('../middleware/validators');

// @route   POST /api/jobs
// @desc    Create a new job specification
// @access  Private (Recruiter only)
router.post('/', protect, validateJob, async (req, res) => {
  const { title, description, required_skills, preferred_skills, min_experience, workflow_spec_id } = req.body;

  try {

    const job = await Job.create({
      title,
      description,
      required_skills: required_skills || [],
      preferred_skills: preferred_skills || [],
      min_experience,
      workflow_spec_id: workflow_spec_id || 'default-hiring-workflow'
    });

    return res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error.message);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Public (So candidate app pages can load jobs)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ created_at: -1 });
    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('List jobs error:', error.message);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get a single job specification by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    return res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job specification
// @access  Private (Recruiter only)
router.put('/:id', protect, validateJob, async (req, res) => {
  const { title, description, required_skills, preferred_skills, min_experience, workflow_spec_id } = req.body;

  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Update fields
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (required_skills !== undefined) job.required_skills = required_skills;
    if (preferred_skills !== undefined) job.preferred_skills = preferred_skills;
    if (min_experience !== undefined) job.min_experience = min_experience;
    if (workflow_spec_id !== undefined) job.workflow_spec_id = workflow_spec_id;

    await job.save();

    return res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
