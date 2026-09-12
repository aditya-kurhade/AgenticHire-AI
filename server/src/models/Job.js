const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  required_skills: {
    type: [String],
    default: []
  },
  preferred_skills: {
    type: [String],
    default: []
  },
  min_experience: {
    type: Number,
    required: true,
    min: 0
  },
  workflow_spec_id: {
    type: String,
    default: 'default-hiring-workflow'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Job', JobSchema);
