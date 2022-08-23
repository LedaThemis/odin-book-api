import { Schema, Types, model } from 'mongoose';

const UserSchema = new Schema(
    {
        displayName: { type: String, required: true },
        photoURL: { type: String, required: true },
        friends: [{ type: Types.ObjectId, ref: 'User', required: true }],
        friendRequests: [
            { type: Types.ObjectId, ref: 'FriendRequest', required: true },
        ],
        accessToken: { type: String, required: true },
        refreshToken: { type: String, required: true },
    },
    { timestamps: true },
);

export default model('User', UserSchema);
