const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open', 'in_progress', 'done'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
});

const postmortemSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true, unique: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['draft', 'in_review', 'published'], default: 'draft' },
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  rootCause: { type: String, default: '' },
  impact: { type: String, default: '' },
  whatWentWell: { type: String, default: '' },
  whatWentWrong: { type: String, default: '' },
  timelineNarrative: { type: String, default: '' },
  preventionSteps: { type: String, default: '' },
  actionItems: [actionItemSchema],
  // AI-generated draft fields
  aiDraftGenerated: { type: Boolean, default: false },
  aiQualityScore: { type: Number, min: 0, max: 10 },
  aiQualityFeedback: { type: String, default: '' },
  // Publication
  publishedAt: { type: Date },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Postmortem', postmortemSchema);
