const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workflowSnapshot: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
    default: 'PENDING'
  },
  currentNode: {
    type: String,
    default: null
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  inputs: {
    type: Object,
    default: {}
  },
  outputs: {
    type: Object,
    default: {}
  },
  error: {
    type: Object,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Execution = mongoose.models.Execution || mongoose.model('Execution', executionSchema);
module.exports = Execution;
