import express from 'express';
import { handleGithubWebhook } from '../controllers/webhook.controller';

const router = express.Router();

router.post('/github/:companyId', handleGithubWebhook);

export default router;
