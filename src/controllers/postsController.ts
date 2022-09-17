import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { Types } from 'mongoose';

import { io } from '../app';
import { IComment } from '../interfaces/Comment';
import { IUser } from '../interfaces/User';
import isLoggedIn from '../middleware/isLoggedIn';
import validObjectId from '../middleware/validObjectId';
import validateErrors from '../middleware/validateErrors';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';
import areFriends from '../utils/areFriends';
import areSameUser from '../utils/areSameUser';
import standardPostPopulate from '../utils/standardPostPopulate';

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
                .populate(standardPostPopulate);

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
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { content, photos }: IPostBody = req.body;

            const post = new Post({
                content,
                photos,
                author: req.user._id,
            });

            const savedPost = await (
                await post.save()
            ).populate(standardPostPopulate);

            const currentUser = await User.findById(req.user._id);

            if (!currentUser) {
                return res.status(404).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'User does not exist.',
                        },
                    ],
                });
            }

            // Send to friends' sockets
            if (currentUser.friends.length > 0) {
                io.to(
                    currentUser.friends.map((f: Types.ObjectId) =>
                        f.toString(),
                    ),
                ).emit('timeline', savedPost);
            }

            return res.json({
                state: 'success',
                post: savedPost,
            });
        } catch (e) {
            return next(e);
        }
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
                return res.status(403).json({
                    state: 'failed',
                    errors: [
                        { msg: 'You are unauthorized to perform this action.' },
                    ],
                });
            }

            const { content, photos }: IPostBody = req.body;

            const updatedPost = await Post.findByIdAndUpdate(
                req.params.postId,
                {
                    content,
                    photos,
                },
                {
                    new: true,
                },
            ).populate(standardPostPopulate);

            const currentUser = await User.findById(req.user._id);

            if (!currentUser) {
                return res.status(404).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'User does not exist.',
                        },
                    ],
                });
            }

            // Send to friends' sockets
            if (currentUser.friends.length > 0) {
                io.to(
                    currentUser.friends.map((f: Types.ObjectId) =>
                        f.toString(),
                    ),
                ).emit('timeline_update', updatedPost);
            }

            return res.json({
                state: 'success',
                post: updatedPost,
            });
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
                return res.status(403).json({
                    state: 'failed',
                    errors: [
                        { msg: 'You are unauthorized to perform this action.' },
                    ],
                });
            }

            const deletedPost = await postToDelete.deleteOne();

            const currentUser = await User.findById(req.user._id);

            if (!currentUser) {
                return res.status(404).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'User does not exist.',
                        },
                    ],
                });
            }

            // Send to friends' sockets
            if (currentUser.friends.length > 0) {
                io.to(
                    currentUser.friends.map((f: Types.ObjectId) =>
                        f.toString(),
                    ),
                ).emit('timeline_delete', deletedPost._id);
            }

            return res.json({
                state: 'success',
                postId: deletedPost._id,
            });
        } catch (err) {
            return next(err);
        }
    },
];

const hasPermissionToInteractWithPost = (
    post: {
        author: { _id: Types.ObjectId; friends: IUser[] | Types.ObjectId[] };
    },
    user: IUser,
) => {
    // Post and comment author are friends
    if (areFriends(post.author, user)) {
        return true;
    }
    // Post and comment authors match
    else if (areSameUser(post.author, user)) {
        return true;
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
            }).populate<{ author: IUser }>('author');

            if (
                !postToCommentOn ||
                !hasPermissionToInteractWithPost(postToCommentOn, req.user)
            ) {
                return res.status(403).json({
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

            const savedComment = await comment.save();
            postToCommentOn.comments.push(savedComment._id);

            const savedPost = await (
                await postToCommentOn.save()
            ).populate(standardPostPopulate);

            return res.json({
                state: 'success',
                post: savedPost,
            });
        } catch (e) {
            return next(e);
        }
    },
];

export const delete_delete_post_comment = [
    isLoggedIn,
    validObjectId('postId'),
    validObjectId('commentId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const post = await Post.findOne({
                _id: req.params.postId,
                comments: req.params.commentId,
            }).populate<{ author: IUser; comments: IComment[] }>(
                'author comments',
            );

            const comment = await Comment.findById(
                req.params.commentId,
            ).populate<{ author: IUser }>('author');

            if (!post || !comment) {
                return res.status(404).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'Invalid comment or post.',
                        },
                    ],
                });
            }

            if (
                areSameUser(comment.author, req.user) ||
                areSameUser(post.author, req.user)
            ) {
                post.comments = post.comments.filter(
                    (c) => !c._id.equals(comment._id),
                );

                const savedPost = await (
                    await post.save()
                ).populate(standardPostPopulate);

                await Comment.findByIdAndDelete(req.params.commentId);

                return res.json({
                    state: 'success',
                    post: savedPost,
                });
            } else {
                return res.status(403).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'You are unauthorized to perform this action.',
                        },
                    ],
                });
            }
        } catch (e) {
            return next(e);
        }
    },
];

export const post_post_like = [
    isLoggedIn,
    validObjectId('postId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postToLike = await Post.findById(req.params.postId).populate<{
                author: IUser;
            }>('author');

            if (
                !postToLike ||
                !hasPermissionToInteractWithPost(postToLike, req.user)
            ) {
                return res.status(403).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'You are unauthorized to perform this action.',
                        },
                    ],
                });
            }

            if (
                !postToLike.likes
                    .map((like) => like.toString())
                    .includes(req.user._id.toString())
            ) {
                postToLike.likes.push(req.user._id);

                const savedPost = await (
                    await postToLike.save()
                ).populate(standardPostPopulate);

                return res.json({
                    state: 'success',
                    post: savedPost,
                });
            } else {
                const populatedPost = await postToLike.populate(
                    standardPostPopulate,
                );

                return res.json({
                    state: 'success',
                    post: populatedPost,
                });
            }
        } catch (e) {
            return next(e);
        }
    },
];

export const post_post_unlike = [
    isLoggedIn,
    validObjectId('postId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postToUnLike = await Post.findById(
                req.params.postId,
            ).populate<{ author: IUser }>('author');

            if (
                !postToUnLike ||
                !hasPermissionToInteractWithPost(postToUnLike, req.user)
            ) {
                return res.status(403).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'You are unauthorized to perform this action.',
                        },
                    ],
                });
            }

            if (
                postToUnLike.likes
                    .map((like) => like.toString())
                    .includes(req.user._id.toString())
            ) {
                postToUnLike.likes = postToUnLike.likes.filter(
                    (likeUserId) =>
                        likeUserId.toString() !== req.user._id.toString(),
                );

                const savedPost = await (
                    await postToUnLike.save()
                ).populate(standardPostPopulate);

                return res.json({
                    state: 'success',
                    post: savedPost,
                });
            } else {
                const populatedPost = await postToUnLike.populate(
                    standardPostPopulate,
                );

                return res.json({
                    state: 'success',
                    post: populatedPost,
                });
            }
        } catch (e) {
            return next(e);
        }
    },
];
