import express from 'express';
import { 
  getIncidents, 
  getIncidentById, 
  createIncident, 
  updateIncident, 
  addTimelineUpdate, 
  runStressTest, 
  getStats, 
  askCopilot, 
  executeRemediation, 
  resolveAndVerify, 
  generateSitrep, 
  deleteIncident, 
  deleteAllIncidents 
} from '../controllers/incident.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

router.get('/stats', protect as any, getStats as any);
router.get('/', protect as any, getIncidents as any);
router.delete('/', protect as any, authorize('admin') as any, deleteAllIncidents as any);
router.get('/:id', protect as any, getIncidentById as any);
router.delete('/:id', protect as any, authorize('admin') as any, deleteIncident as any);
router.post('/:id/chat', protect as any, authorize('admin', 'engineer') as any, askCopilot as any);
router.post('/', protect as any, authorize('admin', 'engineer') as any, createIncident as any);
router.put('/:id', protect as any, authorize('admin', 'engineer') as any, updateIncident as any);
router.post('/:id/timeline', protect as any, authorize('admin', 'engineer') as any, addTimelineUpdate as any);
router.post('/:id/remediate', protect as any, authorize('admin', 'engineer') as any, executeRemediation as any);
router.post('/:id/resolve-verify', protect as any, authorize('admin', 'engineer') as any, resolveAndVerify as any);
router.post('/:id/sitrep', protect as any, authorize('admin', 'engineer') as any, generateSitrep as any);
router.post('/stress-test', protect as any, authorize('admin') as any, runStressTest as any);

export default router;
