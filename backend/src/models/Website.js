const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['up', 'down', 'degraded', 'unknown'], default: 'unknown' },
  lastChecked: { type: Date },
  responseTime: { type: Number, default: 0 }, // ms
  uptimePercent: { type: Number, default: 100 },
  checkInterval: { type: Number, default: 5 }, // minutes
  isActive: { type: Boolean, default: true },
  // Dependency tracking for Blast Radius feature
  dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Website' }],
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Website', websiteSchema);
