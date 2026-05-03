import express from 'express';
import { 
  getPostmortems, 
  createPostmortem, 
  updatePostmortem, 
  deletePostmortem 
} from '../controllers/postmortem.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

router.get('/', protect as any, getPostmortems as any);
router.post('/', protect as any, authorize('admin', 'engineer') as any, createPostmortem as any);
router.put('/:id', protect as any, authorize('admin', 'engineer') as any, updatePostmortem as any);
router.delete('/:id', protect as any, authorize('admin') as any, deletePostmortem as any);

export default router;
