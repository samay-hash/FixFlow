import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebsite extends Document {
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded' | 'unknown';
  lastChecked?: Date;
  responseTime: number;
  uptimePercent: number;
  checkInterval: number;
  isActive: boolean;
  dependsOn: mongoose.Types.ObjectId[];
  companyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const websiteSchema: Schema<IWebsite> = new Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['up', 'down', 'degraded', 'unknown'], default: 'unknown' },
  lastChecked: { type: Date },
  responseTime: { type: Number, default: 0 },
  uptimePercent: { type: Number, default: 100 },
  checkInterval: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
  dependsOn: [{ type: Schema.Types.ObjectId, ref: 'Website' }],
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Website: Model<IWebsite> = mongoose.model<IWebsite>('Website', websiteSchema);
export default Website;
