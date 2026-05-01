const Postmortem = require('../models/Postmortem');
const Incident = require('../models/Incident');
const aiService = require('../services/ai.service');

// @GET /api/postmortems
const getPostmortems = async (req, res) => {
  try {
    const postmortems = await Postmortem.find({ companyId: req.user.companyId })
      .populate('incidentId', 'title severity createdAt resolvedAt')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: postmortems.length, postmortems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/postmortems — Generate AI draft
const createPostmortem = async (req, res) => {
  try {
    const { incidentId } = req.body;

    const incident = await Incident.findOne({ _id: incidentId, companyId: req.user.companyId })
      .populate('siteId', 'name url')
      .populate('assignedTo', 'name')
      .populate('timeline.updatedBy', 'name');

    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    const existing = await Postmortem.findOne({ incidentId });
    if (existing) return res.status(400).json({ success: false, message: 'Postmortem already exists for this incident' });

    // Generate AI draft
    const aiDraft = await aiService.generatePostmortem(incident);

    const postmortem = await Postmortem.create({
      incidentId,
      companyId: req.user.companyId,
      title: `Postmortem: ${incident.title}`,
      summary: aiDraft.summary || '',
      rootCause: aiDraft.rootCause || '',
      impact: aiDraft.impact || '',
      whatWentWell: aiDraft.whatWentWell || '',
      whatWentWrong: aiDraft.whatWentWrong || '',
      preventionSteps: aiDraft.preventionSteps || '',
      timelineNarrative: aiDraft.timelineNarrative || '',
      aiDraftGenerated: true,
      aiQualityScore: aiDraft.qualityScore || null,
      aiQualityFeedback: aiDraft.qualityFeedback || '',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, postmortem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/postmortems/:id
const updatePostmortem = async (req, res) => {
  try {
    const postmortem = await Postmortem.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!postmortem) return res.status(404).json({ success: false, message: 'Postmortem not found' });

    const allowedFields = ['title', 'summary', 'rootCause', 'impact', 'whatWentWell', 'whatWentWrong', 'preventionSteps', 'timelineNarrative', 'actionItems', 'status'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) postmortem[field] = req.body[field];
    });

    if (req.body.status === 'published') {
      postmortem.publishedAt = new Date();
      postmortem.publishedBy = req.user._id;
    }

    // Re-score with AI if content changed significantly
    if (req.body.rootCause || req.body.preventionSteps) {
      const scored = await aiService.scorePostmortem(postmortem);
      postmortem.aiQualityScore = scored.score;
      postmortem.aiQualityFeedback = scored.feedback;
    }

    await postmortem.save();
    res.json({ success: true, postmortem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPostmortems, createPostmortem, updatePostmortem };
