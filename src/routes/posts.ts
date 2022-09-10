import { Router } from 'express';

import * as postsController from '../controllers/postsController';

const router = Router();

// CREATE post
router.post('/', postsController.post_create_post);

// UPDATE post
router.post('/:postId', postsController.post_update_post);

// DELETE post
router.delete('/:postId', postsController.delete_delete_post);

// CREATE post comment
router.post('/:postId/comments', postsController.post_create_post_comment);

export default router;
