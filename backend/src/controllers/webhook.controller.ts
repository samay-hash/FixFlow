import { Request, Response } from 'express';
import Incident from '../models/Incident';
import Log from '../models/Log';
import { getIO } from '../socket/socket';
import Website from '../models/Website';

// @POST /api/webhooks/github/:companyId
export const handleGithubWebhook = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const eventType = req.headers['x-github-event'] as string;
    const payload = req.body;

    // Immediately respond to GitHub to prevent timeouts
    res.status(200).json({ success: true, message: 'Webhook received' });

    // We only care about workflow_run failures or push errors for this example
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
      const site = await Website.findOne({ companyId: companyId as any });

      const incident = await Incident.create({
        title,
        description: message,
        severity: 'high',
        status: 'open',
        source: 'github-webhook',
        siteId: site?._id as any,
        companyId: companyId as any,
        timeline: [{
          message: 'Incident automatically created via GitHub Webhook integration.',
          type: 'system' as any,
        }] as any,
      } as any);

      await Log.create({
        message: `[WEBHOOK] ${message}`,
        level: 'error',
        source: 'github',
        companyId: companyId as any,
        siteId: site?._id as any,
        incidentId: incident._id as any,
      });

      const io = getIO();
      io.to(`company_${companyId}`).emit('incident:created', incident);
      io.to(`company_${companyId}`).emit('notification:alert', {
        message: title,
        severity: 'high',
        incidentId: incident._id,
      });
    }

  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
  }
};
