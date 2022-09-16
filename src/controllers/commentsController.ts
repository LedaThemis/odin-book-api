import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

import Comment from '../models/Comment';
import isLoggedIn from '../middleware/isLoggedIn';
import validObjectId from '../middleware/validObjectId';
import validateErrors from '../middleware/validateErrors';

export const post_update_comment = [
    isLoggedIn,
    validObjectId('commentId'),
    body('content', 'Comment must not be empty.').trim().isLength({ min: 1 }),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const comment = await Comment.findOne({
                _id: req.params.commentId,
                author: req.user._id,
            });

            if (!comment) {
                return res.json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'You are unauthorized to perform this action.',
                        },
                    ],
                });
            }

            comment.content = req.body.content;

            const savedComment = await (
                await comment.save()
            ).populate('author');

            return res.json({
                state: 'success',
                comment: savedComment,
            });
        } catch (e) {
            return next(e);
        }
    },
];
