const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema({
  message: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['observation', 'action_taken', 'status_change', 'system', 'ai_insight'], default: 'observation' },
  isPublic: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  // Category / department for routing (e.g. backend, frontend, database)
  category: { type: String, enum: ['backend', 'frontend', 'database', 'infrastructure', 'network', 'security', 'other'], default: 'other' },
  source: { type: String, enum: ['manual', 'auto'], default: 'auto' },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timeline: [timelineEntrySchema],
  // Health Score (0-100): drops over time, rises with action
  healthScore: { type: Number, default: 100 },
  // AI-generated fields
  aiRootCause: { type: String, default: '' },
  aiSitrep: { type: String, default: '' }, // Live AI War Room Summary
  // Timestamps
  acknowledgedAt: { type: Date },
  resolvedAt: { type: Date },
  // MTTD & MTTR (in seconds)
  mttd: { type: Number },
  mttr: { type: Number },
}, { timestamps: true });

// Auto-compute health score before save
incidentSchema.pre('save', function () {
  if (this.status === 'resolved') {
    this.healthScore = 100;
    return;
  }
  const created = this.createdAt || new Date();
  const ageMinutes = (Date.now() - created) / 60000;
  let score = 100 - (ageMinutes * 0.5);
  if (this.severity === 'critical' && !this.acknowledgedAt) score -= 20;
  if (this.assignedTo && this.assignedTo.length > 0) score += 15;
  if (this.timeline && this.timeline.length > 2) score += 10;
  if (this.status === 'in_progress') score += 15;
  this.healthScore = Math.max(0, Math.min(100, Math.round(score)));
});

module.exports = mongoose.model('Incident', incidentSchema);
