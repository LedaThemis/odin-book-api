import { Schema, model } from 'mongoose';

import { IUser } from '../interfaces/User';

const UserSchema = new Schema<IUser>(
    {
        id: { type: String, required: true },
        displayName: { type: String, required: true },
        photoURL: { type: String, required: true },
        friends: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        friendRequests: [
            {
                type: Schema.Types.ObjectId,
                ref: 'FriendRequest',
                required: true,
            },
        ],
    },
    { timestamps: true },
);

export default model('User', UserSchema);
