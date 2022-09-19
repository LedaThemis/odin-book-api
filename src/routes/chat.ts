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

// POST message send
router.post('/rooms/:roomId/messages', chatController.post_message_send);

// DELETE chat room message
router.delete(
    '/rooms/:roomId/messages/:messageId',
    chatController.delete_delete_room_message,
);

export default router;
