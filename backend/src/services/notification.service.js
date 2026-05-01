const logger = require('../utils/logger');

// Gracefully handle missing nodemailer without crashing
let transporter = null;
try {
  const nodemailer = require('nodemailer');
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    logger.info('📧 Email transporter configured');
  }
} catch (err) {
  logger.warn('Email not configured, skipping notifications');
}

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    logger.warn(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"SIMRS Alerts" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    logger.info(`📧 Email sent to ${to}`);
  } catch (err) {
    logger.error(`Email failed: ${err.message}`);
  }
};

const sendDownAlert = async (site, incident) => {
  const User = require('../models/User');
  const engineers = await User.find({
    companyId: site.companyId,
    role: { $in: ['admin', 'engineer'] },
  });

  const emails = engineers.map(e => e.email);
  if (emails.length === 0) return;

  await sendEmail({
    to: emails.join(','),
    subject: `🚨 CRITICAL: ${site.name} is DOWN — Incident Created`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin:0;">🚨 Production Alert</h1>
        </div>
        <div style="background: #1a1a2e; color: #e2e8f0; padding: 24px; border-radius: 0 0 8px 8px;">
          <p><strong>Site:</strong> ${site.name} (${site.url})</p>
          <p><strong>Status:</strong> DOWN ❌</p>
          <p><strong>Incident ID:</strong> ${incident._id}</p>
          <p><strong>Severity:</strong> CRITICAL</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <a href="${process.env.FRONTEND_URL}/incidents/${incident._id}" 
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3b82f6;color:white;border-radius:6px;text-decoration:none;">
            View Incident →
          </a>
        </div>
      </div>
    `,
  });
};

const sendInviteEmail = async ({ to, inviterName, companyName, inviteUrl, role, category }) => {
  await sendEmail({
    to,
    subject: `You're invited to join ${companyName} on FixFlow`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <div style="background: #0f172a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin:0;">Invitation to Join FixFlow</h1>
        </div>
        <div style="background: #1a1a2e; color: #e2e8f0; padding: 24px; border-radius: 0 0 8px 8px;">
          <p><strong>${inviterName}</strong> invited you to join <strong>${companyName}</strong>.</p>
          <p><strong>Role:</strong> ${role}</p>
          <p><strong>Category:</strong> ${category}</p>
          <a href="${inviteUrl}"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3b82f6;color:white;border-radius:6px;text-decoration:none;">
            Accept Invitation →
          </a>
        </div>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendDownAlert, sendInviteEmail };
