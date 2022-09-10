import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

import { IPost } from '../interfaces/Post';
import { IUser } from '../interfaces/User';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';
import isLoggedIn from '../utils/isLoggedIn';
import validObjectId from '../utils/validObjectId';
import validateErrors from '../utils/validateErrors';

interface IPostBody {
    content: string;
    photos: string[];
}

export const get_timeline = [
    isLoggedIn,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userIdsList = req.user.friends.concat([req.user._id]);

            // Get all posts from friends and self in descending order
            const timelinePosts = await Post.find({
                author: { $in: userIdsList },
            })
                .sort({ _id: -1 })
                .populate([
                    'author',
                    {
                        path: 'comments',
                        populate: {
                            path: 'author',
                        },
                    },
                ]);

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
    isLoggedIn,
    body('content', 'Content must not be empty.').trim().isLength({ min: 1 }),
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

export const post_update_post = [
    isLoggedIn,
    validObjectId('postId'),
    body('content', 'Content must not be empty.').trim().isLength({ min: 1 }),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postToUpdate = await Post.findOne({
                _id: req.params.postId,
                author: req.user._id,
            });

            if (!postToUpdate) {
                return res.json({
                    state: 'failed',
                    errors: [
                        { msg: 'You are unauthorized to perform this action.' },
                    ],
                });
            }

            const { content, photos }: IPostBody = req.body;

            Post.findByIdAndUpdate(req.params.postId, { content, photos }).exec(
                (err, updatedPost) => {
                    if (err) return next(err);

                    return res.json({
                        state: 'success',
                        post: updatedPost,
                    });
                },
            );
        } catch (err) {
            return next(err);
        }
    },
];

export const delete_delete_post = [
    isLoggedIn,
    validObjectId('postId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postToDelete = await Post.findOne({
                _id: req.params.postId,
                author: req.user._id,
            });

            if (!postToDelete) {
                return res.json({
                    state: 'failed',
                    errors: [
                        { msg: 'You are unauthorized to perform this action.' },
                    ],
                });
            }

            Post.findByIdAndDelete(req.params.postId).exec(
                (err, deletedPost) => {
                    if (err) return next(err);

                    return res.json({
                        state: 'success',
                        post: deletedPost,
                    });
                },
            );
        } catch (err) {
            return next(err);
        }
    },
];

const hasPermissionToCommentOnPost = (post: IPost, user: IUser) => {
    if (post.author instanceof User) {
        // Post and comment author are  friends
        if (!post.author.friends.includes(user._id)) {
            return true;
        }

        // Post and comment authors match
        else if (post.author._id.toString() === user._id.toString()) {
            return true;
        }
    } else {
        return false;
    }
};

export const post_create_post_comment = [
    isLoggedIn,
    validObjectId('postId'),
    body('content', 'Comment must not be empty.').trim().isLength({ min: 1 }),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postToCommentOn = await Post.findOne({
                _id: req.params.postId,
            }).populate('author');

            if (
                !postToCommentOn ||
                !hasPermissionToCommentOnPost(postToCommentOn, req.user)
            ) {
                return res.json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'You are unauthorized to perform this action.',
                        },
                    ],
                });
            }

            const comment = new Comment({
                content: req.body.content,
                author: req.user._id,
            });

            comment.save((err, savedComment) => {
                if (err) return next(err);

                postToCommentOn.comments.push(savedComment._id);

                postToCommentOn.save((err, savedPost) => {
                    if (err) return next(err);

                    return res.json({
                        state: 'success',
                        post: savedPost,
                    });
                });
            });
        } catch (e) {
            return next(e);
        }
    },
];
