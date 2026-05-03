import express from 'express';
import { 
  getSites, 
  addSite, 
  updateSite, 
  deleteSite, 
  getUptimeHistory, 
  getPublicStatus 
} from '../controllers/site.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

router.get('/public/:slug', getPublicStatus);
router.get('/', protect as any, getSites as any);
router.post('/', protect as any, authorize('admin', 'engineer') as any, addSite as any);
router.put('/:id', protect as any, authorize('admin') as any, updateSite as any);
router.delete('/:id', protect as any, authorize('admin') as any, deleteSite as any);
router.get('/:id/uptime', protect as any, getUptimeHistory as any);

export default router;
