const express = require('express');
const router = express.Router();
const { handleGithubWebhook } = require('../controllers/webhook.controller');

router.post('/github/:companyId', handleGithubWebhook);

module.exports = router;
