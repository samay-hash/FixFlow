import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUptimeSnapshot extends Document {
  siteId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  statusCode?: number;
  timestamp: Date;
}

const uptimeSnapshotSchema: Schema<IUptimeSnapshot> = new Schema({
  siteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['up', 'down', 'degraded'], required: true },
  responseTime: { type: Number, default: 0 },
  statusCode: { type: Number },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

uptimeSnapshotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
uptimeSnapshotSchema.index({ siteId: 1, timestamp: -1 });

const UptimeSnapshot: Model<IUptimeSnapshot> = mongoose.model<IUptimeSnapshot>('UptimeSnapshot', uptimeSnapshotSchema);
export default UptimeSnapshot;
