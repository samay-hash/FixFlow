const express = require('express');
const router = express.Router();
const { getIncidents, getIncidentById, createIncident, updateIncident, addTimelineUpdate, runStressTest, getStats, askCopilot, executeRemediation, resolveAndVerify, generateSitrep, deleteIncident, deleteAllIncidents } = require('../controllers/incident.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/stats', protect, getStats);
router.get('/', protect, getIncidents);
router.delete('/', protect, authorize('admin'), deleteAllIncidents);
router.get('/:id', protect, getIncidentById);
router.delete('/:id', protect, authorize('admin'), deleteIncident);
router.post('/:id/chat', protect, authorize('admin', 'engineer'), askCopilot);
router.post('/', protect, authorize('admin', 'engineer'), createIncident);
router.put('/:id', protect, authorize('admin', 'engineer'), updateIncident);
router.post('/:id/timeline', protect, authorize('admin', 'engineer'), addTimelineUpdate);
router.post('/:id/remediate', protect, authorize('admin', 'engineer'), executeRemediation);
router.post('/:id/resolve-verify', protect, authorize('admin', 'engineer'), resolveAndVerify);
router.post('/:id/sitrep', protect, authorize('admin', 'engineer'), generateSitrep);
router.post('/stress-test', protect, authorize('admin'), runStressTest);

module.exports = router;
