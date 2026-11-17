const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['engineering', 'product', 'compliance', 'cultural', 'leadership', 'compensation', 'general'],
      default: 'general'
    },
    text: {
      type: String,
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null
    },
    indexedChunks: {
      type: Number,
      default: 0
    },
    lastIndexedAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: String,
      default: 'recruiter'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Policy', PolicySchema);
