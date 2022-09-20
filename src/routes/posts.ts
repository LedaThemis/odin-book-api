import { Router } from 'express';

import * as postsController from '../controllers/postsController';

const router = Router();

// CREATE post
router.post('/', postsController.post_create_post);

// READ post likes
router.get('/:postId/likes', postsController.get_get_post_likes)

// UPDATE post
router.post('/:postId', postsController.post_update_post);

// DELETE post
router.delete('/:postId', postsController.delete_delete_post);

// CREATE post comment
router.post('/:postId/comments', postsController.post_create_post_comment);

// DELETE post comment
router.delete(
    '/:postId/comments/:commentId',
    postsController.delete_delete_post_comment,
);

// Like post
router.post('/:postId/like', postsController.post_post_like);

// Unlike post
router.delete('/:postId/like', postsController.post_post_unlike);

export default router;
