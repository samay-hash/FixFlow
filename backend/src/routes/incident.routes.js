const express = require('express');
const router = express.Router();
const { getIncidents, getIncidentById, createIncident, updateIncident, addTimelineUpdate, runStressTest, getStats, askCopilot, executeRemediation } = require('../controllers/incident.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/stats', protect, getStats);
router.get('/', protect, getIncidents);
router.get('/:id', protect, getIncidentById);
router.post('/:id/chat', protect, authorize('admin', 'engineer'), askCopilot);
router.post('/', protect, authorize('admin', 'engineer'), createIncident);
router.put('/:id', protect, authorize('admin', 'engineer'), updateIncident);
router.post('/:id/timeline', protect, authorize('admin', 'engineer'), addTimelineUpdate);
router.post('/:id/remediate', protect, authorize('admin', 'engineer'), executeRemediation);
router.post('/stress-test', protect, authorize('admin'), runStressTest);

module.exports = router;
