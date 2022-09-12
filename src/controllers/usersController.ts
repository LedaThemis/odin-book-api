import { NextFunction, Request, Response } from 'express';
import { query } from 'express-validator';

import User from '../models/User';
import isLoggedIn from '../utils/isLoggedIn';
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
