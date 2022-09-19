import { Router } from 'express';

import * as chatController from '../controllers/chatController';

const router = Router();

// GET user conversations
router.get('/conversations', chatController.get_get_conversations);

export default router;
