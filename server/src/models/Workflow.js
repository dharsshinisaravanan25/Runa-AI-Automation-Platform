const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  triggerConfig: {
    type: Object,
    default: {
      type: 'manual',
      schedule: '',
      webhookPath: ''
    }
  },
  nodes: {
    type: Array,
    default: []
  },
  edges: {
    type: Array,
    default: []
  },
  version: {
    type: Number,
    default: 1
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);
module.exports = Workflow;
