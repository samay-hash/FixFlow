const mongoose = require('mongoose');

const serverLogSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  serverIp: { type: String, required: true },
  source: { type: String, default: 'syslog' }, // e.g., 'nginx', 'node', 'syslog'
  level: { type: String, enum: ['INFO', 'WARN', 'ERROR', 'FATAL'], default: 'INFO' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false } // Set to true when moved to S3
});

// Indexes for fast querying
serverLogSchema.index({ companyId: 1, timestamp: -1 });
serverLogSchema.index({ companyId: 1, level: 1 });

module.exports = mongoose.model('ServerLog', serverLogSchema);
