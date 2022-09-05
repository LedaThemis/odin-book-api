import { Router } from 'express';
import passport from 'passport';

import * as indexController from '../controllers/indexController';

const router = Router();

router.get('/', indexController.index);

router.get('/login', passport.authenticate('google'));

export default router;
