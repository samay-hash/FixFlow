import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITimelineEntry {
  message: string;
  updatedBy?: mongoose.Types.ObjectId;
  type: 'observation' | 'action_taken' | 'status_change' | 'system' | 'ai_insight';
  isPublic: boolean;
  timestamp: Date;
}

export interface IIncident extends Document {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  category: 'backend' | 'frontend' | 'database' | 'infrastructure' | 'network' | 'security' | 'other';
  source: 'manual' | 'auto';
  siteId?: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  companyId: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  timeline: ITimelineEntry[];
  healthScore: number;
  aiRootCause?: string;
  aiSitrep?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  mttd?: number;
  mttr?: number;
  createdAt: Date;
  updatedAt: Date;
}

const timelineEntrySchema: Schema = new Schema({
  message: { type: String, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['observation', 'action_taken', 'status_change', 'system', 'ai_insight'], default: 'observation' },
  isPublic: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const incidentSchema: Schema<IIncident> = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  category: { type: String, enum: ['backend', 'frontend', 'database', 'infrastructure', 'network', 'security', 'other'], default: 'other' },
  source: { type: String, enum: ['manual', 'auto'], default: 'auto' },
  siteId: { type: Schema.Types.ObjectId, ref: 'Website' },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  timeline: [timelineEntrySchema],
  healthScore: { type: Number, default: 100 },
  aiRootCause: { type: String, default: '' },
  aiSitrep: { type: String, default: '' },
  acknowledgedAt: { type: Date },
  resolvedAt: { type: Date },
  mttd: { type: Number },
  mttr: { type: Number },
}, { timestamps: true });

incidentSchema.pre('save', async function (this: any) {
  if (this.status === 'resolved') {
    this.healthScore = 100;
    return;
  }
  const created = (this.createdAt as Date) || new Date();
  const ageMinutes = (Date.now() - created.getTime()) / 60000;
  let score = 100 - (ageMinutes * 0.5);
  if (this.severity === 'critical' && !this.acknowledgedAt) score -= 20;
  if (this.assignedTo && this.assignedTo.length > 0) score += 15;
  if (this.timeline && this.timeline.length > 2) score += 10;
  if (this.status === 'in_progress') score += 15;
  this.healthScore = Math.max(0, Math.min(100, Math.round(score)));
});

const Incident: Model<IIncident> = mongoose.model<IIncident>('Incident', incidentSchema);
export default Incident;
