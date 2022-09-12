import { NextFunction, Request, Response } from 'express';
import { query } from 'express-validator';

import { IUser } from '../interfaces/User';
import Post from '../models/Post';
import User from '../models/User';
import canSeePosts from '../utils/canSeePosts';
import isLoggedIn from '../utils/isLoggedIn';
import standardPostPopulate from '../utils/standardPostPopulate';
import validObjectId from '../utils/validObjectId';
import validateErrors from '../utils/validateErrors';

export const get_query_users = [
    isLoggedIn,
    query('q', 'Query must not be empty.').trim().isLength({ min: 1 }),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await User.find({
                $text: { $search: `"${req.query.q}"` },
            });

            return res.json({
                state: 'success',
                users,
            });
        } catch (e) {
            return next(e);
        }
    },
];

export const get_user_details = [
    isLoggedIn,
    validObjectId('userId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await User.findById(req.params.userId).populate(
                'friends',
            );

            if (!user) {
                return res.json({
                    state: 'failed',
                    errors: [{ msg: 'User does not exist.' }],
                });
            }

            return res.json({
                state: 'success',
                user,
            });
        } catch (e) {
            return next(e);
        }
    },
];

export const get_user_posts = [
    isLoggedIn,
    validObjectId('userId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await User.findById(req.params.userId).populate<{
                friends: IUser[];
            }>('friends');

            if (!user) {
                return res.json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'User does not exist.',
                        },
                    ],
                });
            }

            if (!canSeePosts(user, req.user)) {
                return res.json({
                    state: 'failed',
                    errors: [
                        { msg: 'You are unauthorized to perform this action.' },
                    ],
                });
            }

            const userPosts = await Post.find({ author: user._id })
                .populate(standardPostPopulate)
                .sort({ _id: -1 });

            return res.json({
                state: 'success',
                posts: userPosts,
            });
        } catch (e) {
            return next(e);
        }
    },
];
