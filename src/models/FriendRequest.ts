import { Schema, Types, model } from 'mongoose';

const FriendRequestSchema = new Schema({
    sender: { type: Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Types.ObjectId, ref: 'User', required: true },
});

export default model('FriendRequest', FriendRequestSchema);
