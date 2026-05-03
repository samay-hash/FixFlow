import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActionItem {
  title: string;
  assignedTo?: mongoose.Types.ObjectId;
  status: 'open' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface IPostmortem extends Document {
  incidentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  status: 'draft' | 'in_review' | 'published';
  title: string;
  summary?: string;
  rootCause?: string;
  impact?: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  timelineNarrative?: string;
  preventionSteps?: string;
  actionItems: IActionItem[];
  aiDraftGenerated: boolean;
  aiQualityScore?: number;
  aiQualityFeedback?: string;
  publishedAt?: Date;
  publishedBy?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const actionItemSchema: Schema = new Schema({
  title: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open', 'in_progress', 'done'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
});

const postmortemSchema: Schema<IPostmortem> = new Schema({
  incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
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
  aiDraftGenerated: { type: Boolean, default: false },
  aiQualityScore: { type: Number, min: 0, max: 10 },
  aiQualityFeedback: { type: String, default: '' },
  publishedAt: { type: Date },
  publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Postmortem: Model<IPostmortem> = mongoose.model<IPostmortem>('Postmortem', postmortemSchema);
export default Postmortem;
