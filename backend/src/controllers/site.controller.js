const Website = require('../models/Website');
const UptimeSnapshot = require('../models/UptimeSnapshot');
const Incident = require('../models/Incident');

// @GET /api/sites
const getSites = async (req, res) => {
  try {
    const sites = await Website.find({ companyId: req.user.companyId }).populate('dependsOn', 'name status');
    res.json({ success: true, count: sites.length, sites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/sites
const addSite = async (req, res) => {
  try {
    const { name, url, checkInterval, dependsOn } = req.body;
    if (!name || !url) return res.status(400).json({ success: false, message: 'Name and URL required' });

    const site = await Website.create({
      name, url, checkInterval,
      dependsOn: dependsOn || [],
      companyId: req.user.companyId,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, site });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/sites/:id
const updateSite = async (req, res) => {
  try {
    const site = await Website.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found' });

    Object.assign(site, req.body);
    await site.save();
    res.json({ success: true, site });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/sites/:id
const deleteSite = async (req, res) => {
  try {
    const site = await Website.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found' });
    res.json({ success: true, message: 'Site deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/sites/:id/uptime
const getUptimeHistory = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const snapshots = await UptimeSnapshot.find({
      siteId: req.params.id,
      companyId: req.user.companyId,
      timestamp: { $gte: since },
    }).sort({ timestamp: 1 });
    res.json({ success: true, snapshots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/sites/public/:slug - For public status page
const getPublicStatus = async (req, res) => {
  try {
    const Company = require('../models/Company');
    const company = await Company.findOne({ slug: req.params.slug });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const sites = await Website.find({ companyId: company._id, isActive: true }).select('name url status lastChecked responseTime uptimePercent');
    const activeIncidents = await Incident.find({
      companyId: company._id,
      status: { $ne: 'resolved' },
    }).select('title severity status createdAt').sort({ createdAt: -1 });

    res.json({ success: true, company: { name: company.name }, sites, activeIncidents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSites, addSite, updateSite, deleteSite, getUptimeHistory, getPublicStatus };
