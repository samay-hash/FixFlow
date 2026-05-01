const express = require('express');
const router = express.Router();
const { getPostmortems, createPostmortem, updatePostmortem, deletePostmortem } = require('../controllers/postmortem.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, getPostmortems);
router.post('/', protect, authorize('admin', 'engineer'), createPostmortem);
router.put('/:id', protect, authorize('admin', 'engineer'), updatePostmortem);
router.delete('/:id', protect, authorize('admin'), deletePostmortem);

module.exports = router;
