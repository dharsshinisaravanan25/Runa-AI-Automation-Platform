const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
    required: true
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  scopes: {
    type: [String],
    default: []
  },
  accountEmail: {
    type: String,
    default: ''
  },
  accountName: {
    type: String,
    default: ''
  },
  // AES-256-GCM encrypted payload
  encryptedCredentials: {
    iv: String,
    authTag: String,
    encryptedData: String
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

const Integration = mongoose.models.Integration || mongoose.model('Integration', integrationSchema);
module.exports = Integration;
