import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  logoUrl?: string;
  category: 'science' | 'engineering' | 'security' | 'devops' | 'operations' | 'research' | 'other';
  preferences: string[];
  createdAt: Date;
  updatedAt: Date;
}

const companySchema: Schema<ICompany> = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  logoUrl: { type: String, default: '' },
  category: { type: String, enum: ['science', 'engineering', 'security', 'devops', 'operations', 'research', 'other'], default: 'engineering' },
  preferences: [{ type: String, trim: true }],
}, { timestamps: true });

companySchema.pre('save', async function (this: any) {
  if (!this.slug && this.name) {
    this.slug = (this.name as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  }
});

const Company: Model<ICompany> = mongoose.model<ICompany>('Company', companySchema);
export default Company;
