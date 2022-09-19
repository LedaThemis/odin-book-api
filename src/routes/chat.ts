import { Router } from 'express';

import * as chatController from '../controllers/chatController';

const router = Router();

// GET user conversations
router.get('/conversations', chatController.get_get_conversations);

// START a conversation
router.post('/conversations', chatController.post_start_conversation);

// GET chat room
router.get('/rooms/:roomId', chatController.get_get_room);

// GET chat room messages
router.get('/rooms/:roomId/messages', chatController.get_get_room_messages);

export default router;
