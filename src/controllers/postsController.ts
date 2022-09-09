import { ensureLoggedIn } from 'connect-ensure-login';
import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

import Post from '../models/Post';
import validateErrors from '../utils/validateErrors';

interface IPostBody {
    content: string;
    photos: string[];
}

export const get_timeline = [
    ensureLoggedIn(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userIdsList = req.user.friends.concat([req.user._id]);

            // Get all posts from friends and self in descending order
            const timelinePosts = await Post.find({
                author: { $in: userIdsList },
            })
                .sort({ _id: -1 })
                .populate('author');

            return res.json({
                state: 'success',
                posts: timelinePosts,
            });
        } catch (e) {
            return next(e);
        }
    },
];

export const post_create_post = [
    ensureLoggedIn(),
    body('content', 'Content must be 32 characters or more')
        .trim()
        .isLength({ min: 32 }),
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
