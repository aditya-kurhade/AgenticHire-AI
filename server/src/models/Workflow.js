const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  current_state: {
    type: String,
    default: 'resume_parser'
  },
  status: {
    type: String,
    enum: ['running', 'success', 'failed', 'paused_approval'],
    default: 'running'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Workflow', WorkflowSchema);
