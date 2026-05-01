const express = require('express');
const router = express.Router();
const { getLogs, ingestLog, getLogSummary } = require('../controllers/log.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getLogs);
router.get('/summary', protect, getLogSummary);
router.post('/ingest', protect, ingestLog);

module.exports = router;
