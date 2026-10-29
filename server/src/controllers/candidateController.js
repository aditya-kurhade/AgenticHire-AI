const fs = require('fs');
const { z } = require('zod');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Workflow = require('../models/Workflow');
const HiringWorkflowEngine = require('../workflows/hiringWorkflow');

const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().optional().default(''),
  jobId: z.string().min(1, 'Job ID is required')
});

/**
 * @desc    Public route to upload a resume and apply for a job
 * @route   POST /api/candidates/upload
 * @access  Public
 */
const uploadCandidate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a resume file' });
    }

    const validationResult = candidateSchema.safeParse(req.body);
    if (!validationResult.success) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      const errorMsg = validationResult.error.issues.map(err => err.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { name, email, phone, jobId } = validationResult.data;

    // Verify Job exists
    const job = await Job.findById(jobId);
    if (!job) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, error: 'Target job specification not found' });
    }

    // Create Candidate entry
    const candidate = await Candidate.create({
      name,
      email,
      phone: phone || '',
      resume_url: `/uploads/${req.file.filename}`,
      job_id: job._id,
      status: 'pending'
    });

    // Auto-trigger the recruitment workflow
    const workflow = await Workflow.create({
      candidate_id: candidate._id,
      job_id: job._id,
      current_state: 'resume_parser',
      status: 'running'
    });

    HiringWorkflowEngine.execute(workflow._id).catch(err => {
      console.error(`Background workflow run error for candidate ${candidate._id}:`, err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: candidate,
      workflowId: workflow._id
    });
  } catch (error) {
    console.error('Candidate upload error:', error.message);
    // Cleanup file if uploaded
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

/**
 * @desc    List all candidate applications (optionally filtered by jobId)
 * @route   GET /api/candidates
 * @access  Private (Recruiter only)
 */
const getCandidates = async (req, res) => {
  try {
    const { jobId } = req.query;
    let query = {};
    if (jobId && jobId !== 'all') {
      // Find directly by job_id or through workflows if legacy candidate missing job_id
      const matchingWorkflows = await Workflow.find({ job_id: jobId }).select('candidate_id');
      const candidateIds = matchingWorkflows.map(w => w.candidate_id);
      query = {
        $or: [
          { job_id: jobId },
          { _id: { $in: candidateIds } }
        ]
      };
    }

    const candidates = await Candidate.find(query)
      .populate('job_id', 'title min_experience required_skills')
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    console.error('List candidates error:', error.message);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get candidate details by ID
 * @route   GET /api/candidates/:id
 * @access  Private (Recruiter only)
 */
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate(
      'job_id',
      'title min_experience required_skills preferred_skills description'
    );
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    return res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Get candidate error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  uploadCandidate,
  getCandidates,
  getCandidateById
};
