const Incident = require('../models/Incident');
const Log = require('../models/Log');
const { getIO } = require('../socket/socket');

// @POST /api/webhooks/github/:companyId
const handleGithubWebhook = async (req, res) => {
  try {
    const { companyId } = req.params;
    const eventType = req.headers['x-github-event'];
    const payload = req.body;

    // Immediately respond to GitHub to prevent timeouts
    res.status(200).json({ success: true, message: 'Webhook received' });

    // We only care about workflow_run failures or push errors for this example
    // If it's a ping event (when user first adds the webhook), just ignore processing
    if (eventType === 'ping') return;

    let isFailure = false;
    let title = 'GitHub Webhook Alert';
    let message = 'An event occurred in your repository.';

    // Very basic parsing for workflow_run (GitHub Actions)
    if (eventType === 'workflow_run') {
      const { workflow_run, repository } = payload;
      if (workflow_run && workflow_run.conclusion === 'failure') {
        isFailure = true;
        title = `🔥 Deployment Failed: ${repository.name}`;
        message = `GitHub Actions workflow '${workflow_run.name}' failed on branch '${workflow_run.head_branch}'. View logs: ${workflow_run.html_url}`;
      }
    } 
    // Fallback: if user sends any generic webhook payload from a custom system
    else if (payload.status === 'failure' || payload.error) {
      isFailure = true;
      title = payload.title || '🔥 External Integration Failure';
      message = payload.message || JSON.stringify(payload);
    }

    if (isFailure) {
      // Find a site to attach it to, or just leave it null
      const Website = require('../models/Website');
      const site = await Website.findOne({ companyId });

      const incident = await Incident.create({
        title,
        description: message,
        severity: 'high',
        status: 'open',
        source: 'github-webhook',
        siteId: site?._id,
        companyId,
        timeline: [{
          message: 'Incident automatically created via GitHub Webhook integration.',
          type: 'system',
        }],
      });

      await Log.create({
        message: `[WEBHOOK] ${message}`,
        level: 'error',
        source: 'github',
        companyId,
        siteId: site?._id,
        incidentId: incident._id,
      });

      const io = getIO();
      io.to(`company_${companyId}`).emit('incident:created', incident);
      io.to(`company_${companyId}`).emit('notification:alert', {
        message: title,
        severity: 'high',
        incidentId: incident._id,
      });
    }

  } catch (err) {
    console.error('Webhook processing error:', err.message);
  }
};

module.exports = { handleGithubWebhook };
