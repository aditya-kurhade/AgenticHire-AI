const Workflow = require('../models/Workflow');
const WorkflowLog = require('../models/WorkflowLog');
const HiringWorkflowEngine = require('../workflows/hiringWorkflow');
const specLoader = require('../utils/specLoader');
const { getLLMConfig, setLLMConfig, checkOllamaHealth } = require('../utils/llmClient');

/**
 * @desc    Get system workflow settings (e.g. node colors and retry policies)
 * @route   GET /api/workflow/settings
 * @access  Private (Recruiter only)
 */
const getWorkflowSettings = async (req, res) => {
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
};

/**
 * @desc    Get LLM configuration and Ollama connectivity
 * @route   GET /api/workflow/llm-settings
 * @access  Private (Recruiter only)
 */
const getWorkflowLLMSettings = async (req, res) => {
  try {
    const config = getLLMConfig();
    const health = await checkOllamaHealth();
    return res.status(200).json({
      success: true,
      data: {
        provider: config.provider,
        ollamaModel: config.ollamaModel,
        ollamaBaseUrl: config.ollamaBaseUrl,
        ollamaStatus: health
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Update LLM provider and local model
 * @route   POST /api/workflow/llm-settings
 * @access  Private (Recruiter only)
 */
const updateWorkflowLLMSettings = async (req, res) => {
  try {
    const { provider, ollamaModel, ollamaBaseUrl } = req.body;
    const updated = setLLMConfig({ provider, ollamaModel, ollamaBaseUrl });
    const health = await checkOllamaHealth();
    return res.status(200).json({
      success: true,
      data: {
        ...updated,
        ollamaStatus: health
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Get detailed state and logs by candidate ID
 * @route   GET /api/workflow/candidate/:candidateId
 * @access  Private (Recruiter only)
 */
const getWorkflowByCandidateId = async (req, res) => {
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
};

/**
 * @desc    Start the recruitment workflow for a candidate
 * @route   POST /api/workflow/start
 * @access  Public
 */
const startWorkflow = async (req, res) => {
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
};

/**
 * @desc    Provide HR reviewer approval or rejection decision
 * @route   POST /api/workflow/approve
 * @access  Private (Recruiter only)
 */
const approveWorkflow = async (req, res) => {
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
};

/**
 * @desc    Manually retry a failed workflow node
 * @route   POST /api/workflow/retry
 * @access  Private (Recruiter only)
 */
const retryWorkflow = async (req, res) => {
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
};

/**
 * @desc    Get detailed state and execution logs for a workflow
 * @route   GET /api/workflow/:id
 * @access  Private (Recruiter only)
 */
const getWorkflowById = async (req, res) => {
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
};

module.exports = {
  getWorkflowSettings,
  getWorkflowLLMSettings,
  updateWorkflowLLMSettings,
  getWorkflowByCandidateId,
  startWorkflow,
  approveWorkflow,
  retryWorkflow,
  getWorkflowById
};
