import { Schema, model } from 'mongoose';

import { IUser } from '../interfaces/User';

const UserSchema = new Schema<IUser>(
    {
        id: { type: String, required: false },
        displayName: { type: String, index: true, required: true },
        photoURL: { type: String, required: true },
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
                default: [],
            },
        ],
        incomingFriendRequests: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
                default: [],
            },
        ],
        custom: {
            photoURL: { type: String, required: false, default: '' },
        },
        guest: { type: Boolean, required: false, default: false },
    },
    { timestamps: true },
);

export default model('User', UserSchema);
