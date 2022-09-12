import { Router } from 'express';

import * as usersController from '../controllers/usersController';

const router = Router();

// Query users
router.get('/search', usersController.get_query_users)


export default router;
