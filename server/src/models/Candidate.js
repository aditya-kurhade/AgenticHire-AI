const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  github_url: {
    type: String,
    trim: true,
    default: null
  },
  resume_url: {
    type: String
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    index: true
  },
  parsed_resume_json: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  match_score: {
    type: Number,
    default: null
  },
  // Dual-Score Architecture (MCP GitHub)
  coding_score: {
    type: Number,
    default: null
  },
  github_username: {
    type: String,
    trim: true,
    default: null
  },
  github_metrics: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    default: 'pending'
  },
  matched_skills: {
    type: [String],
    default: []
  },
  missing_skills: {
    type: [String],
    default: []
  },
  interview_rubric: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Candidate', CandidateSchema);
