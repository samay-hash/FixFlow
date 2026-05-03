import express from 'express';
import { 
  getLogs, 
  ingestLog, 
  getLogSummary, 
  agentIngest, 
  analyzeServerLogs 
} from '../controllers/log.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect as any, getLogs as any);
router.get('/summary', protect as any, getLogSummary as any);
router.post('/ingest', protect as any, ingestLog as any);

// Server Log Endpoints
router.post('/agent/ingest', agentIngest); // No JWT, uses X-Agent-Token
router.get('/analyze', protect as any, analyzeServerLogs as any);

export default router;
