const mongoose = require('mongoose');

const uptimeSnapshotSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['up', 'down', 'degraded'], required: true },
  responseTime: { type: Number, default: 0 }, // ms
  statusCode: { type: Number },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

// TTL Index - snapshots older than 90 days auto-delete
uptimeSnapshotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
uptimeSnapshotSchema.index({ siteId: 1, timestamp: -1 });

module.exports = mongoose.model('UptimeSnapshot', uptimeSnapshotSchema);
