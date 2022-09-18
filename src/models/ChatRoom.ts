import { Schema, model } from 'mongoose';

import { IChatRoom } from '../interfaces/ChatRoom';

const ChatRoomSchema = new Schema<IChatRoom>({
    members: [
        {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    ],
    messages: [
        {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Message',
            default: [],
        },
    ],
});

export default model('ChatRoom', ChatRoomSchema);
