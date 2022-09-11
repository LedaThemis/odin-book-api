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

// Like post
router.post('/:postId/like', postsController.post_post_like);

// Unlike post
router.delete('/:postId/like', postsController.post_post_unlike);

export default router;
