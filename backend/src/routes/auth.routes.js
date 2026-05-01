const express = require('express');
const router = express.Router();
const { register, login, getMe, getTeam, inviteTeamMember, getInviteByToken, acceptInvite } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/invite/:token', getInviteByToken);
router.post('/invite/accept', acceptInvite);
router.get('/me', protect, getMe);
router.get('/team', protect, getTeam);
router.post('/invite', protect, authorize('admin'), inviteTeamMember);

module.exports = router;
