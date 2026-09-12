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
  resume_url: {
    type: String
  },
  parsed_resume_json: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  match_score: {
    type: Number,
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
