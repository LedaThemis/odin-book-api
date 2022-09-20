import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { Types, isValidObjectId } from 'mongoose';

import { io } from '../app';
import isLoggedIn from '../middleware/isLoggedIn';
import validObjectId from '../middleware/validObjectId';
import validateErrors from '../middleware/validateErrors';
import ChatRoom from '../models/ChatRoom';
import Message from '../models/Message';
import User from '../models/User';

export const get_get_conversations = [
    isLoggedIn,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Find rooms that user is member of
            const conversations = await ChatRoom.find({
                members: req.user._id,
            }).populate('members');

            return res.json({
                state: 'success',
                conversations,
            });
        } catch (e) {
            return next(e);
        }
    },
];

export const post_start_conversation = [
    isLoggedIn,
    body('userId', 'Invalid User Id').custom((userId) =>
        isValidObjectId(userId),
    ),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await User.findOne({
                _id: req.body.userId,
                friends: req.user._id,
            });

            if (!user) {
                return res.status(403).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'You need to be friends with user to perform this action.',
                        },
                    ],
                });
            }

            const pastRoom = await ChatRoom.findOne({
                members: {
                    $all: [req.user._id, user._id],
                    $size: 2,
                },
            });

            // If user has started a conversation before, return it
            if (pastRoom) {
                return res.json({
                    state: 'success',
                    room: pastRoom,
                });
            }

            const chatRoom = new ChatRoom({
                members: [req.user._id, user._id],
            });

            const savedRoom = await chatRoom.save();

            const roomMembersExceptUser = savedRoom.members
                .filter((u) => u.toString() !== req.user._id.toString())
                .map((id) => id.toString());

            io.to(roomMembersExceptUser).emit('invalidate', [
                'chat',
                'conversations',
            ]);

            return res.json({
                state: 'success',
                room: savedRoom,
            });
        } catch (e) {
            return next(e);
        }
    },
];

export const get_get_room = [
    isLoggedIn,
    validObjectId('roomId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const room = await ChatRoom.findOne({
                _id: req.params.roomId,
                members: req.user._id,
            }).populate('members');

            if (!room) {
                return res.status(404).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'Room does not exist.',
                        },
                    ],
                });
            }

            return res.json({
                state: 'success',
                room,
            });
        } catch (e) {
            return next(e);
        }
    },
];

export const get_get_room_messages = [
    isLoggedIn,
    validObjectId('roomId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const room = await ChatRoom.findOne({
                _id: req.params.roomId,
                members: req.user._id,
            }).populate({
                path: 'messages',
                populate: {
                    path: 'author',
                },
            });

            if (!room) {
                return res.status(404).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'Room does not exist.',
                        },
                    ],
                });
            }

            return res.json({
                state: 'success',
                messages: room.messages,
            });
        } catch (e) {
            return next(e);
        }
    },
];

export const post_message_send = [
    isLoggedIn,
    validObjectId('roomId'),
    body('content', 'Content must not be empty.').trim().isLength({ min: 1 }),
    body('attachments', 'Attachments must be a list').isArray(),
    validateErrors,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const room = await ChatRoom.findOne({
                _id: req.params.roomId,
                members: req.user._id,
            });

            if (!room) {
                return res.status(404).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'Room does not exist.',
                        },
                    ],
                });
            }

            const roomMembersExceptUser = room.members
                .filter((m) => !m._id.equals(req.user._id))
                .map((m) => m.toString());

            // Some room members are friends of user
            const areFriendsInRoom = roomMembersExceptUser.some((id) =>
                req.user.friends
                    .map((id: Types.ObjectId) => id.toString())
                    .includes(id.toString()),
            );

            if (!areFriendsInRoom) {
                return res.status(403).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'You are not friends with any of the users in this room.',
                        },
                    ],
                });
            }

            const message = new Message({
                content: req.body.content,
                attachments: req.body.attachments ?? [],
                author: req.user._id,
            });

            const savedMessage = await (
                await message.save()
            ).populate('author');

            // Push new message to room messages
            room.messages.push(savedMessage._id);

            await room.save();

            // Emit to all users except current user
            io.to(roomMembersExceptUser).emit('invalidate', [
                'chat',
                'rooms',
                room._id.toString(),
                'messages',
            ]);

            return res.json({
                state: 'success',
                message: savedMessage,
            });
        } catch (e) {
            return next(e);
        }
    },
];

export const delete_delete_room_message = [
    isLoggedIn,
    validObjectId('roomId'),
    validObjectId('messageId'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const room = await ChatRoom.findOne({
                _id: req.params.roomId,
                members: req.user._id,
                messages: req.params.messageId,
            });

            if (!room) {
                return res.status(404).json({
                    state: 'failed',
                    errors: [
                        {
                            msg: 'Room or message do not exist.',
                        },
                    ],
                });
            }

            // Delete message from messages array
            room.messages = room.messages.filter(
                (m) => m.toString() !== req.params.messageId,
            );

            await Message.deleteOne({ _id: req.params.messageId });

            await room.save();

            // Emit to all users except current user
            const roomMembersExceptUser = room.members
                .filter((m) => !m._id.equals(req.user._id))
                .map((m) => m.toString());

            io.to(roomMembersExceptUser).emit('invalidate', [
                'chat',
                'rooms',
                room._id.toString(),
                'messages',
            ]);

            return res.json({
                state: 'success',
            });
        } catch (e) {
            return next(e);
        }
    },
];
