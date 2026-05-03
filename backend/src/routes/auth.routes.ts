import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  getTeam, 
  inviteTeamMember, 
  getInviteByToken, 
  acceptInvite, 
  getUnassignedUsers 
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/invite/:token', getInviteByToken);
router.post('/invite/accept', acceptInvite);
router.get('/me', protect as any, getMe as any);
router.get('/team', protect as any, getTeam as any);
router.get('/unassigned', protect as any, authorize('admin') as any, getUnassignedUsers as any);
router.post('/invite', protect as any, authorize('admin') as any, inviteTeamMember as any);

export default router;
