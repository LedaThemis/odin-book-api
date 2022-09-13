import { Router } from 'express';

import * as usersController from '../controllers/usersController';

const router = Router();

// Query users
router.get('/search', usersController.get_query_users);

// GET user
router.get('/:userId', usersController.get_user_details);

// GET user posts
router.get('/:userId/posts', usersController.get_user_posts);

// GET user friends
router.get('/:userId/friends', usersController.get_get_user_friends);

// Friend user
router.post('/:userId/friend', usersController.post_friend_user);

// Unfriend user
router.delete('/:userId/friend', usersController.delete_unfriend_user);

export default router;
