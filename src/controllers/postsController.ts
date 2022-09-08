import { ensureLoggedIn } from 'connect-ensure-login';
import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

import Post from '../models/Post';
import validateErrors from '../utils/validateErrors';

interface IPostBody {
    content: string;
    photos: string[];
}

export const post_create_post = [
    ensureLoggedIn(),
    body('content', 'Content must be 32 characters or more')
        .trim()
        .isLength({ min: 32 })
        .escape(),
    validateErrors,
    (req: Request, res: Response, next: NextFunction) => {
        const { content, photos }: IPostBody = req.body;

        const post = new Post({
            content,
            photos,
            author: req.user._id,
        });

        post.save((err, savedPost) => {
            if (err) return next(err);

            return res.json({
                state: 'success',
                post: savedPost,
            });
        });
    },
];
