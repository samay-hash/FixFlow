import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'engineer' | 'viewer';
  companyId: mongoose.Types.ObjectId;
  avatar?: string;
  isOnCall: boolean;
  preferences: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'engineer', 'viewer'], default: 'engineer' },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  avatar: { type: String, default: '' },
  isOnCall: { type: Boolean, default: false },
  preferences: [{ type: String, trim: true }],
}, { timestamps: true });

userSchema.pre('save', async function (this: any) {
  if (!(this as any).isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err: any) {
    throw err;
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
