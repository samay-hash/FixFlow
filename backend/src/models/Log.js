const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, enum: ['info', 'warning', 'error', 'fatal'], default: 'info' },
  source: { type: String, default: 'system' }, // 'system' | 'webhook' | 'manual'
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website' },
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
  // AI-generated summary of this log group
  aiSummary: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

// Index for fast queries
logSchema.index({ companyId: 1, timestamp: -1 });
logSchema.index({ siteId: 1, level: 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);
