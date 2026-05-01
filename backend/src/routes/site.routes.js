const express = require('express');
const router = express.Router();
const { getSites, addSite, updateSite, deleteSite, getUptimeHistory, getPublicStatus } = require('../controllers/site.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/public/:slug', getPublicStatus); // Public — no auth
router.get('/', protect, getSites);
router.post('/', protect, authorize('admin', 'engineer'), addSite);
router.put('/:id', protect, authorize('admin'), updateSite);
router.delete('/:id', protect, authorize('admin'), deleteSite);
router.get('/:id/uptime', protect, getUptimeHistory);

module.exports = router;
