const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { z } = require('zod');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const HiringWorkflowEngine = require('../workflows/hiringWorkflow');

const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().optional().default(''),
  jobId: z.string().min(1, 'Job ID is required')
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File validation filter (PDF only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF resumes are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   POST /api/candidates/upload
// @desc    Public route to upload a resume and apply for a job
// @access  Public
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a resume file' });
    }

    const validationResult = candidateSchema.safeParse(req.body);
    if (!validationResult.success) {
      fs.unlinkSync(req.file.path);
      const errorMsg = validationResult.error.issues.map(err => err.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { name, email, phone, jobId } = validationResult.data;

    // Verify Job exists
    const job = await Job.findById(jobId);
    if (!job) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, error: 'Target job specification not found' });
    }

    // Create Candidate entry
    const candidate = await Candidate.create({
      name,
      email,
      phone: phone || '',
      resume_url: `/uploads/${req.file.filename}`,
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
});

// @route   GET /api/candidates
// @desc    List all candidate applications
// @access  Private (Recruiter only)
router.get('/', protect, async (req, res) => {
  try {
    const candidates = await Candidate.find({}).sort({ created_at: -1 });
    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    console.error('List candidates error:', error.message);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/candidates/:id
// @desc    Get candidate details by ID
// @access  Private (Recruiter only)
router.get('/:id', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
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
});

module.exports = router;
