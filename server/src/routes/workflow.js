const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWorkflowSettings,
  getWorkflowLLMSettings,
  updateWorkflowLLMSettings,
  getWorkflowByCandidateId,
  startWorkflow,
  approveWorkflow,
  retryWorkflow,
  getWorkflowById
} = require('../controllers/workflowController');

// @route   GET /api/workflow/settings
// @desc    Get system workflow settings (e.g. node colors)
// @access  Private (Recruiter only)
router.get('/settings', protect, getWorkflowSettings);

// @route   GET /api/workflow/llm-settings
// @desc    Get LLM configuration and Ollama connectivity
// @access  Private (Recruiter only)
router.get('/llm-settings', protect, getWorkflowLLMSettings);

// @route   POST /api/workflow/llm-settings
// @desc    Update LLM provider and local model
// @access  Private (Recruiter only)
router.post('/llm-settings', protect, updateWorkflowLLMSettings);

// @route   GET /api/workflow/candidate/:candidateId
// @desc    Get detailed state and logs by candidate ID
// @access  Private (Recruiter only)
router.get('/candidate/:candidateId', protect, getWorkflowByCandidateId);

// @route   POST /api/workflow/start
// @desc    Start the recruitment workflow for a candidate
// @access  Public (so the application page upload can trigger it directly)
router.post('/start', startWorkflow);

// @route   POST /api/workflow/approve
// @desc    Provide HR reviewer approval or rejection decision
// @access  Private (Recruiter only)
router.post('/approve', protect, approveWorkflow);

// @route   POST /api/workflow/retry
// @desc    Manually retry a failed workflow node
// @access  Private (Recruiter only)
router.post('/retry', protect, retryWorkflow);

// @route   GET /api/workflow/:id
// @desc    Get detailed state and execution logs for a workflow
// @access  Private (Recruiter only)
router.get('/:id', protect, getWorkflowById);

module.exports = router;
