import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILog extends Document {
  message: string;
  level: 'info' | 'warning' | 'error' | 'fatal';
  source: string;
  metadata: any;
  companyId: mongoose.Types.ObjectId;
  siteId?: mongoose.Types.ObjectId;
  incidentId?: mongoose.Types.ObjectId;
  aiSummary?: string;
  timestamp: Date;
}

const logSchema: Schema<ILog> = new Schema({
  message: { type: String, required: true },
  level: { type: String, enum: ['info', 'warning', 'error', 'fatal'], default: 'info' },
  source: { type: String, default: 'system' },
  metadata: { type: Schema.Types.Mixed, default: {} },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  siteId: { type: Schema.Types.ObjectId, ref: 'Website' },
  incidentId: { type: Schema.Types.ObjectId, ref: 'Incident' },
  aiSummary: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

logSchema.index({ companyId: 1, timestamp: -1 });
logSchema.index({ siteId: 1, level: 1, timestamp: -1 });

const Log: Model<ILog> = mongoose.model<ILog>('Log', logSchema);
export default Log;
