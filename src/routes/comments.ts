import { Router } from 'express';

import * as commentsController from '../controllers/commentsController';

const router = Router();

// UPDATE comment
router.post('/:commentId', commentsController.post_update_comment);

export default router;
