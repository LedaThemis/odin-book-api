import { NextFunction, Request, Response } from 'express';
import { query } from 'express-validator';

import User from '../models/User';
import isLoggedIn from '../utils/isLoggedIn';
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
