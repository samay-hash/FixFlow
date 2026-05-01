const express = require('express');
const router = express.Router();
const { getLogs, ingestLog, getLogSummary, agentIngest, analyzeServerLogs } = require('../controllers/log.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getLogs);
router.get('/summary', protect, getLogSummary);
router.post('/ingest', protect, ingestLog);

// Server Log Endpoints
router.post('/agent/ingest', agentIngest); // No JWT, uses X-Agent-Token
router.get('/analyze', protect, analyzeServerLogs);

module.exports = router;
