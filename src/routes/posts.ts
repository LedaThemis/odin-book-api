import { Router } from 'express';

import * as postsController from '../controllers/postsController';

const router = Router();

// CREATE post
router.post('/', postsController.post_create_post);

// UPDATE post
router.post('/:postId', postsController.post_update_post);

export default router;
