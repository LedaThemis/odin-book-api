import { NextFunction, Request, Response } from 'express';
import { query } from 'express-validator';

import { IUser } from '../interfaces/User';
import Post from '../models/Post';
import User from '../models/User';
import areFriends from '../utils/areFriends';
import canSeePosts from '../utils/canSeePosts';
import hasSentFriendRequest from '../utils/hasSentFriendRequest';
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

export const post_friend_user = [
    isLoggedIn,
    validObjectId('userId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.params._id === req.user._id.toString()) {
                return res.json({
                    state: 'failed',
                    errors: [
                        {
                            msg: "Can't friend self :(",
                        },
                    ],
                });
            }

            const currentUser = await User.findById(req.user._id);

            const recipient = await User.findOne({ _id: req.params.userId });

            if (!recipient || !currentUser) {
                return res.json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'User does not exist.',
                        },
                    ],
                });
            }

            // Has not sent a friend request
            if (
                recipient.incomingFriendRequests.every(
                    (u) => !u.equals(currentUser._id),
                )
            ) {
                // User has friend request from recipient
                if (
                    currentUser.incomingFriendRequests.some((u) =>
                        u.equals(recipient._id),
                    )
                ) {
                    // Remove recipient from incomingFriendRequests
                    currentUser.incomingFriendRequests =
                        currentUser.incomingFriendRequests.filter(
                            (u) => !u.equals(recipient._id),
                        );

                    // Add recipient to user friends
                    currentUser.friends.push(recipient._id);

                    // Add user to recipient friends
                    recipient.friends.push(currentUser._id);

                    // Save current user
                    await currentUser.save();

                    // Save recipient
                    const savedUser = await (
                        await recipient.save()
                    ).populate('friends');

                    return res.json({
                        state: 'success',
                        user: savedUser,
                    });
                } else {
                    recipient.incomingFriendRequests.push(req.user._id);

                    const savedUser = await (
                        await recipient.save()
                    ).populate('friends');

                    return res.json({
                        state: 'success',
                        user: savedUser,
                    });
                }
            } else {
                return res.json({
                    state: 'success',
                    user: recipient,
                });
            }
        } catch (e) {
            return next(e);
        }
    },
];

export const delete_unfriend_user = [
    isLoggedIn,
    validObjectId('userId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = await User.findById(req.user._id);

            const recipient = await User.findOne({
                _id: req.params.userId,
            }).populate<{ friends: IUser[] }>('friends');

            if (!recipient || !currentUser) {
                return res.json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'User does not exist.',
                        },
                    ],
                });
            }

            // Current user has friend requested before, we remove it
            if (hasSentFriendRequest(currentUser, recipient)) {
                recipient.incomingFriendRequests =
                    recipient.incomingFriendRequests.filter(
                        (u) => !u.equals(currentUser._id),
                    );

                const savedUser = await (
                    await recipient.save()
                ).populate<{ friends: IUser[] }>('friends');

                return res.json({
                    state: 'success',
                    user: savedUser,
                });
            }

            // Recipient has friend requested, we reject it
            else if (hasSentFriendRequest(recipient, currentUser)) {
                currentUser.incomingFriendRequests =
                    currentUser.incomingFriendRequests.filter(
                        (u) => !u.equals(recipient._id),
                    );

                await currentUser.save();

                return res.json({
                    state: 'success',
                    user: recipient,
                });
            }
            // Current user is friends with recipient
            else if (areFriends(recipient, currentUser)) {
                recipient.friends = recipient.friends.filter(
                    (u) => !u._id.equals(currentUser._id),
                );

                currentUser.friends = currentUser.friends.filter(
                    (u) => !u.equals(recipient._id),
                );

                await currentUser.save();

                const savedUser = await (
                    await recipient.save()
                ).populate('friends');

                return res.json({
                    state: 'success',
                    user: savedUser,
                });
            } else {
                return res.json({
                    state: 'failed',
                    errors: [{ msg: 'You are not friends with user.' }],
                });
            }
        } catch (e) {
            return next(e);
        }
    },
];
