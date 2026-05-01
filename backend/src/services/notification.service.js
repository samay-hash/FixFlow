const logger = require('../utils/logger');

// ── Resend Email Service ──────────────────────────────────────────────────────
// Get your free API key at: https://resend.com → Create API Key
// Free tier: 3,000 emails/month, 100/day
// Add a verified domain OR use onboarding@resend.dev for testing
// ─────────────────────────────────────────────────────────────────────────────

let resendClient = null;

try {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    logger.info('📧 Resend email client configured');
  } else {
    logger.warn('RESEND_API_KEY not set — emails will be skipped');
  }
} catch (err) {
  logger.warn('Resend not available:', err.message);
}

// From address — must be a verified domain in Resend dashboard
// For testing without a domain, use: onboarding@resend.dev (sends only to your Resend account email)
const FROM_ADDRESS = process.env.RESEND_FROM || 'FixFlow Alerts <onboarding@resend.dev>';

/**
 * Core send function — wraps Resend API
 * @param {{ to: string|string[], subject: string, html: string }} opts
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!resendClient) {
    logger.warn(`[EMAIL SKIPPED] No Resend client. To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      logger.error(`Resend error: ${JSON.stringify(error)}`);
      return { error };
    }

    logger.info(`📧 Email sent via Resend → ${Array.isArray(to) ? to.join(', ') : to} | ID: ${data?.id}`);
    return { data };
  } catch (err) {
    logger.error(`Email send failed: ${err.message}`);
    return { error: err.message };
  }
};

// ── Alert Templates ───────────────────────────────────────────────────────────

/**
 * Site DOWN alert — sent to all admins & engineers in the company
 */
const sendDownAlert = async (site, incident) => {
  const User = require('../models/User');
  const engineers = await User.find({
    companyId: site.companyId,
    role: { $in: ['admin', 'engineer'] },
  }).select('email name');

  const emails = engineers.map(e => e.email).filter(Boolean);
  if (emails.length === 0) return;

  const incidentUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/incidents/${incident._id}`;
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  await sendEmail({
    to: emails,
    subject: `🚨 CRITICAL: ${site.name} is DOWN — Incident #${incident._id.toString().slice(-6)}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
        
        <!-- Header -->
        <div style="background: #FF2D55; padding: 24px 32px;">
          <h1 style="margin:0; color:white; font-size:22px; font-weight:800;">
            🚨 Production Site Down
          </h1>
          <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
            FixFlow Incident Alert System
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 32px; background: #ffffff;">
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <tr>
              <td style="padding:10px 0; color:#666; width:130px; font-weight:600;">Site</td>
              <td style="padding:10px 0; color:#111; font-weight:700;">${site.name}</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 0; color:#666; font-weight:600;">URL</td>
              <td style="padding:10px 0;"><a href="${site.url}" style="color:#0050FF;">${site.url}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 0; color:#666; font-weight:600;">Status</td>
              <td style="padding:10px 0;">
                <span style="background:#FF2D55;color:white;padding:2px 10px;border-radius:4px;font-weight:700;font-size:12px;">DOWN ❌</span>
              </td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 0; color:#666; font-weight:600;">Severity</td>
              <td style="padding:10px 0;">
                <span style="background:#FF2D55;color:white;padding:2px 10px;border-radius:4px;font-weight:700;font-size:12px;">CRITICAL</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0; color:#666; font-weight:600;">Incident ID</td>
              <td style="padding:10px 0; font-family:monospace; color:#444;">${incident._id}</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 0; color:#666; font-weight:600;">Detected At</td>
              <td style="padding:10px 0; color:#444;">${time} IST</td>
            </tr>
          </table>

          <div style="margin-top:24px; padding:16px; background:#FFF5F5; border-left:4px solid #FF2D55; border-radius:4px;">
            <p style="margin:0; color:#c0392b; font-size:13px; font-weight:600;">
              ⚡ FixFlow has automatically created an incident. Your team has been notified.
            </p>
          </div>

          <a href="${incidentUrl}"
             style="display:inline-block;margin-top:24px;padding:14px 28px;background:#0050FF;color:white;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">
            View Incident & Respond →
          </a>
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px; background:#f5f5f5; text-align:center; border-top:1px solid #e0e0e0;">
          <p style="margin:0; color:#999; font-size:12px;">
            FixFlow — Smart Incident Monitoring & Response<br/>
            You're receiving this because you're an admin/engineer in this workspace.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Team invite email
 */
const sendInviteEmail = async ({ to, inviterName, companyName, inviteUrl, role, category }) => {
  await sendEmail({
    to,
    subject: `${inviterName} invited you to join ${companyName} on FixFlow`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
        
        <!-- Header -->
        <div style="background: #0050FF; padding: 24px 32px;">
          <h1 style="margin:0; color:white; font-size:22px; font-weight:800;">
            You've Been Invited 🎉
          </h1>
          <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
            FixFlow — Smart Incident Monitoring
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 32px; background: #ffffff;">
          <p style="color:#333; font-size:15px; line-height:1.6;">
            <strong>${inviterName}</strong> has invited you to join 
            <strong>${companyName}</strong> on FixFlow as a 
            <strong>${role}</strong>${category ? ` in the ${category} team` : ''}.
          </p>

          <div style="margin:20px 0; padding:16px; background:#F0F4FF; border-left:4px solid #0050FF; border-radius:4px;">
            <p style="margin:0; color:#333; font-size:13px;">
              FixFlow helps your team monitor uptime, respond to incidents faster, and auto-generate AI postmortems.
            </p>
          </div>

          <a href="${inviteUrl}"
             style="display:inline-block;padding:14px 28px;background:#0050FF;color:white;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">
            Accept Invitation →
          </a>

          <p style="margin-top:16px; color:#999; font-size:12px;">
            This invite expires in 7 days. If you didn't expect this, you can safely ignore it.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px; background:#f5f5f5; text-align:center; border-top:1px solid #e0e0e0;">
          <p style="margin:0; color:#999; font-size:12px;">FixFlow · Smart Incident Monitoring & Response</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendDownAlert, sendInviteEmail };
