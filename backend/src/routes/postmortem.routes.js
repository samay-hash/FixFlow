const express = require('express');
const router = express.Router();
const { getPostmortems, createPostmortem, updatePostmortem } = require('../controllers/postmortem.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, getPostmortems);
router.post('/', protect, authorize('admin', 'engineer'), createPostmortem);
router.put('/:id', protect, authorize('admin', 'engineer'), updatePostmortem);

module.exports = router;
