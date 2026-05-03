import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvite extends Document {
  email: string;
  name?: string;
  token: string;
  role: 'admin' | 'engineer' | 'viewer';
  category: 'science' | 'engineering' | 'security' | 'devops' | 'operations' | 'research' | 'other';
  preferences: string[];
  companyId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  acceptedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inviteSchema: Schema<IInvite> = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  name: { type: String, trim: true, default: '' },
  token: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['admin', 'engineer', 'viewer'], default: 'engineer' },
  category: { type: String, enum: ['science', 'engineering', 'security', 'devops', 'operations', 'research', 'other'], default: 'engineering' },
  preferences: [{ type: String, trim: true }],
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'revoked', 'expired'], default: 'pending' },
  acceptedAt: { type: Date },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const Invite: Model<IInvite> = mongoose.model<IInvite>('Invite', inviteSchema);
export default Invite;
