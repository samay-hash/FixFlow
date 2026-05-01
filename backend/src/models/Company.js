const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  logoUrl: { type: String, default: '' },
}, { timestamps: true });

companySchema.pre('save', function () {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  }
});

module.exports = mongoose.model('Company', companySchema);
