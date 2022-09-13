import dotenv from 'dotenv';
import { Router } from 'express';
import passport from 'passport';

import * as indexController from '../controllers/indexController';
import * as postsController from '../controllers/postsController';
import * as usersController from '../controllers/usersController';

dotenv.config();

const router = Router();

router.get('/', indexController.index);

router.get('/me', indexController.get_current_user_details);

router.get('/people', usersController.get_get_user_people);

router.get('/login', passport.authenticate('google'));

router.post('/logout', indexController.post_logout_user);

router.get(
    '/oauth2/redirect/google',
    passport.authenticate('google'),
    (req, res) => res.redirect(process.env.CLIENT_REDIRECT_URL),
);

router.get('/oauth2/failed', indexController.get_user_unauthenicated);
router.delete('/oauth2/failed', indexController.get_user_unauthenicated);

router.get('/timeline', postsController.get_timeline);

export default router;
