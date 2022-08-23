import { Schema, Types, model } from 'mongoose';

interface IFriendRequest {
    sender: Types.ObjectId;
    recipient: Types.ObjectId;
}

const FriendRequestSchema = new Schema<IFriendRequest>({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default model('FriendRequest', FriendRequestSchema);
