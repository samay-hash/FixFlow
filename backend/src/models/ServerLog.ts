import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServerLog extends Document {
  companyId: mongoose.Types.ObjectId;
  serverIp: string;
  source: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  timestamp: Date;
  archived: boolean;
}

const serverLogSchema: Schema<IServerLog> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  serverIp: { type: String, required: true },
  source: { type: String, default: 'syslog' },
  level: { type: String, enum: ['INFO', 'WARN', 'ERROR', 'FATAL'], default: 'INFO' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false }
});

serverLogSchema.index({ companyId: 1, timestamp: -1 });
serverLogSchema.index({ companyId: 1, level: 1 });

const ServerLog: Model<IServerLog> = mongoose.model<IServerLog>('ServerLog', serverLogSchema);
export default ServerLog;
