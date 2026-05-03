import { Request, Response } from 'express';
import Website from '../models/Website';
import UptimeSnapshot from '../models/UptimeSnapshot';
import Incident from '../models/Incident';
import Company from '../models/Company';
import { AuthRequest } from '../middleware/auth.middleware';

// @GET /api/sites
export const getSites = async (req: AuthRequest, res: Response) => {
  try {
    const sites = await Website.find({ companyId: req.user?.companyId }).populate('dependsOn', 'name status');
    res.json({ success: true, count: sites.length, sites });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/sites
export const addSite = async (req: AuthRequest, res: Response) => {
  try {
    const { name, url, checkInterval, dependsOn } = req.body;
    if (!name || !url) return res.status(400).json({ success: false, message: 'Name and URL required' });

    const site = await Website.create({
      name, url, checkInterval,
      dependsOn: dependsOn || [],
      companyId: req.user?.companyId,
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, site });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/sites/:id
export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    const site = await Website.findOne({ _id: req.params.id, companyId: req.user?.companyId });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found' });

    Object.assign(site, req.body);
    await site.save();
    res.json({ success: true, site });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/sites/:id
export const deleteSite = async (req: AuthRequest, res: Response) => {
  try {
    const site = await Website.findOneAndDelete({ _id: req.params.id, companyId: req.user?.companyId });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found' });
    res.json({ success: true, message: 'Site deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/sites/:id/uptime
export const getUptimeHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
    const snapshots = await UptimeSnapshot.find({
      siteId: req.params.id,
      companyId: req.user?.companyId,
      timestamp: { $gte: since },
    }).sort({ timestamp: 1 });
    res.json({ success: true, snapshots });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/sites/public/:slug - For public status page
export const getPublicStatus = async (req: Request, res: Response) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const sites = await Website.find({ companyId: company._id, isActive: true }).select('name url status lastChecked responseTime uptimePercent');
    const activeIncidents = await Incident.find({
      companyId: company._id,
      status: { $ne: 'resolved' },
    }).select('title severity status createdAt').sort({ createdAt: -1 });

    res.json({ success: true, company: { name: company.name }, sites, activeIncidents });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
