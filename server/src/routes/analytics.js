const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Workflow = require('../models/Workflow');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics
// @desc    Get aggregate recruiter analytics for candidates and workflows
// @access  Private (Recruiter only)
router.get('/', protect, async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments({});
    
    // Status counts
    const shortlistCount = await Candidate.countDocuments({ status: 'shortlist' });
    const holdCount = await Candidate.countDocuments({ status: 'hold' });
    const rejectCount = await Candidate.countDocuments({ status: 'reject' });
    const pendingCount = await Candidate.countDocuments({ status: 'pending' });

    // Averages
    const averageScoreResult = await Candidate.aggregate([
      { $match: { match_score: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: '$match_score' } } }
    ]);
    const avgMatchScore = averageScoreResult.length > 0 ? Math.round(averageScoreResult[0].avgScore) : 0;

    // Workflow completion stats
    const totalWorkflows = await Workflow.countDocuments({});
    const successWorkflows = await Workflow.countDocuments({ status: 'success' });
    const failedWorkflows = await Workflow.countDocuments({ status: 'failed' });
    const runningWorkflows = await Workflow.countDocuments({ status: 'running' });
    const pausedWorkflows = await Workflow.countDocuments({ status: 'paused_approval' });

    // Calculate rates
    const shortlistRate = totalCandidates > 0 ? Math.round((shortlistCount / totalCandidates) * 100) : 0;
    const completionRate = totalWorkflows > 0 ? Math.round((successWorkflows / totalWorkflows) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalCandidates,
        avgMatchScore,
        rates: {
          shortlist: shortlistRate,
          completion: completionRate
        },
        candidatesByStatus: {
          shortlist: shortlistCount,
          hold: holdCount,
          reject: rejectCount,
          pending: pendingCount
        },
        workflowsByStatus: {
          success: successWorkflows,
          failed: failedWorkflows,
          running: runningWorkflows,
          paused: pausedWorkflows
        }
      }
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error.message);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
