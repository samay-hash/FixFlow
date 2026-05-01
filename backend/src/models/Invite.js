const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  name: { type: String, trim: true, default: '' },
  token: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['admin', 'engineer', 'viewer'], default: 'engineer' },
  category: { type: String, enum: ['science', 'engineering', 'security', 'devops', 'operations', 'research', 'other'], default: 'engineering' },
  preferences: [{ type: String, trim: true }],
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'revoked', 'expired'], default: 'pending' },
  acceptedAt: { type: Date },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Invite', inviteSchema);