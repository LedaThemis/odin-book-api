import { Schema, model } from 'mongoose';

import { IUser } from '../interfaces/User';

const UserSchema = new Schema<IUser>(
    {
        id: { type: String, required: true },
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
    },
    { timestamps: true },
);

export default model('User', UserSchema);
