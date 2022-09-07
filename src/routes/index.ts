import dotenv from 'dotenv';
import { Router } from 'express';
import passport from 'passport';

import * as indexController from '../controllers/indexController';

dotenv.config();

const router = Router();

router.get('/', indexController.index);

router.get('/me', indexController.get_current_user_details);

router.get('/login', passport.authenticate('google'));

router.post('/logout', indexController.post_logout_user);

router.get(
    '/oauth2/redirect/google',
    passport.authenticate('google'),
    (req, res) => res.redirect(process.env.CLIENT_REDIRECT_URL),
);

export default router;
