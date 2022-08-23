import { Schema, Types, model } from 'mongoose';

interface IUser {
    displayName: string;
    photoURL: string;
    friends: Types.ObjectId[];
    friendRequests: Types.ObjectId[];
    accessToken: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        displayName: { type: String, required: true },
        photoURL: { type: String, required: true },
        friends: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        friendRequests: [
            { type: Schema.Types.ObjectId, ref: 'FriendRequest', required: true },
        ],
        accessToken: { type: String, required: true },
        refreshToken: { type: String, required: true },
    },
    { timestamps: true },
);

export default model('User', UserSchema);
