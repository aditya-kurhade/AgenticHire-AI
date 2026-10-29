const Candidate = require('../models/Candidate');
const Workflow = require('../models/Workflow');

/**
 * @desc    Get aggregate recruiter analytics for candidates and workflows
 * @route   GET /api/analytics
 * @access  Private (Recruiter only)
 */
const getAnalytics = async (req, res) => {
  try {
    const { jobId } = req.query;
    let candidateQuery = {};
    let workflowQuery = {};

    if (jobId && jobId !== 'all') {
      const matchingWorkflows = await Workflow.find({ job_id: jobId }).select('candidate_id');
      const candidateIds = matchingWorkflows.map(w => w.candidate_id);
      candidateQuery = {
        $or: [
          { job_id: jobId },
          { _id: { $in: candidateIds } }
        ]
      };
      workflowQuery = { job_id: jobId };
    }

    const totalCandidates = await Candidate.countDocuments(candidateQuery);

    // Status counts
    const shortlistCount = await Candidate.countDocuments({ ...candidateQuery, status: 'shortlist' });
    const holdCount = await Candidate.countDocuments({ ...candidateQuery, status: 'hold' });
    const rejectCount = await Candidate.countDocuments({ ...candidateQuery, status: 'reject' });
    const pendingCount = await Candidate.countDocuments({ ...candidateQuery, status: 'pending' });

    // Averages
    const averageScoreResult = await Candidate.aggregate([
      { $match: { ...candidateQuery, match_score: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: '$match_score' } } }
    ]);
    const avgMatchScore = averageScoreResult.length > 0 ? Math.round(averageScoreResult[0].avgScore) : 0;

    // Workflow completion stats
    const totalWorkflows = await Workflow.countDocuments(workflowQuery);
    const successWorkflows = await Workflow.countDocuments({ ...workflowQuery, status: 'success' });
    const failedWorkflows = await Workflow.countDocuments({ ...workflowQuery, status: 'failed' });
    const runningWorkflows = await Workflow.countDocuments({ ...workflowQuery, status: 'running' });
    const pausedWorkflows = await Workflow.countDocuments({ ...workflowQuery, status: 'paused_approval' });

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
};

module.exports = {
  getAnalytics
};
