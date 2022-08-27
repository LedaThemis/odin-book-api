import { Schema, Types, model } from 'mongoose';

export interface IUser {
    id: string;
    displayName: string;
    photoURL: string;
    friends: Types.ObjectId[];
    friendRequests: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

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
