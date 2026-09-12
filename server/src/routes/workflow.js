const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const WorkflowLog = require('../models/WorkflowLog');
const HiringWorkflowEngine = require('../workflows/hiringWorkflow');
const { protect } = require('../middleware/auth');
const specLoader = require('../utils/specLoader');

// @route   GET /api/workflow/settings
// @desc    Get system workflow settings (e.g. node colors)
// @access  Private (Recruiter only)
router.get('/settings', protect, async (req, res) => {
  try {
    const nodeColors = specLoader.loadNodeColors();
    const retryPolicy = specLoader.loadRetryPolicy();
    return res.status(200).json({
      success: true,
      data: {
        nodeColors,
        retryPolicy
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/workflow/candidate/:candidateId
// @desc    Get detailed state and logs by candidate ID
// @access  Private (Recruiter only)
router.get('/candidate/:candidateId', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ candidate_id: req.params.candidateId });
    if (!workflow) {
      return res.status(200).json({ success: true, data: null });
    }
    const logs = await WorkflowLog.find({ workflow_id: workflow._id }).sort({ created_at: 1 });
    return res.status(200).json({
      success: true,
      data: {
        workflow,
        logs
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/workflow/start
// @desc    Start the recruitment workflow for a candidate
// @access  Public (so the application page upload can trigger it directly)
router.post('/start', async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, error: 'candidateId and jobId are required.' });
    }

    // Check if workflow already exists
    let workflow = await Workflow.findOne({ candidate_id: candidateId, job_id: jobId });
    if (workflow) {
      return res.status(400).json({ success: false, error: 'Workflow already started for this application.', workflow });
    }

    // Create workflow entry
    workflow = await Workflow.create({
      candidate_id: candidateId,
      job_id: jobId,
      current_state: 'resume_parser',
      status: 'running'
    });

    // Run async in background (without blocking client response)
    HiringWorkflowEngine.execute(workflow._id).catch(err => {
      console.error(`Background workflow run error for ${workflow._id}:`, err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Workflow started successfully',
      data: workflow
    });
  } catch (error) {
    console.error('Start workflow error:', error.message);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// @route   POST /api/workflow/approve
// @desc    Provide HR reviewer approval or rejection decision
// @access  Private (Recruiter only)
router.post('/approve', protect, async (req, res) => {
  try {
    const { workflowId, decision } = req.body;
    if (!workflowId || !decision) {
      return res.status(400).json({ success: false, error: 'workflowId and decision are required.' });
    }

    if (decision !== 'approve' && decision !== 'reject') {
      return res.status(400).json({ success: false, error: "Decision must be either 'approve' or 'reject'." });
    }

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found.' });
    }

    // Run resume trigger
    const updatedWorkflow = await HiringWorkflowEngine.resume(workflowId, decision);

    return res.status(200).json({
      success: true,
      message: `Workflow resumed with decision: ${decision}`,
      data: updatedWorkflow
    });
  } catch (error) {
    console.error('Approve workflow error:', error.message);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// @route   POST /api/workflow/retry
// @desc    Manually retry a failed workflow node
// @access  Private (Recruiter only)
router.post('/retry', protect, async (req, res) => {
  try {
    const { workflowId } = req.body;
    if (!workflowId) {
      return res.status(400).json({ success: false, error: 'workflowId is required.' });
    }

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found.' });
    }

    if (workflow.status !== 'failed') {
      return res.status(400).json({ success: false, error: 'Only failed workflows can be retried.' });
    }

    // Run async execution retry
    HiringWorkflowEngine.execute(workflow._id).catch(err => {
      console.error(`Background workflow retry error for ${workflow._id}:`, err.message);
    });

    workflow.status = 'running';
    await workflow.save();

    return res.status(200).json({
      success: true,
      message: 'Workflow retry triggered successfully',
      data: workflow
    });
  } catch (error) {
    console.error('Retry workflow error:', error.message);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// @route   GET /api/workflow/:id
// @desc    Get detailed state and execution logs for a workflow
// @access  Private (Recruiter only)
router.get('/:id', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found.' });
    }

    const logs = await WorkflowLog.find({ workflow_id: workflow._id }).sort({ created_at: 1 });

    return res.status(200).json({
      success: true,
      data: {
        workflow,
        logs
      }
    });
  } catch (error) {
    console.error('Get workflow logs error:', error.message);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

module.exports = router;
