import dotenv from 'dotenv';
import { Router } from 'express';
import passport from 'passport';

import * as indexController from '../controllers/indexController';
import * as postsController from '../controllers/postsController';
import * as usersController from '../controllers/usersController';

dotenv.config();

const router = Router();

// GET API status
router.get('/', indexController.index);

// GET current user
router.get('/me', indexController.get_current_user_details);

// UPDATE current user
router.post('/me', usersController.post_update_user_details);

// GET incoming friend requests
router.get('/incoming', usersController.get_get_incoming_friend_requests);

// GET outgoing friend requests
router.get('/outgoing', usersController.get_get_outgoing_friend_requests);

// GET people user might know
router.get('/people', usersController.get_get_user_people);

// GET login page
router.get('/login', passport.authenticate('google'));

// POST log out user
router.post('/logout', indexController.post_logout_user);

router.get(
    '/oauth2/redirect/google',
    passport.authenticate('google'),
    (req, res) => res.redirect(process.env.CLIENT_REDIRECT_URL),
);

router.get('/oauth2/failed', indexController.get_user_unauthenicated);
router.delete('/oauth2/failed', indexController.get_user_unauthenicated);

// GET current user timeline
router.get('/timeline', postsController.get_timeline);

// GET guest users
router.get('/guests', usersController.get_get_guests);

// Login as guest
router.post('/guests', usersController.post_guest_login);

export default router;
