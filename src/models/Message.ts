import { Schema, model } from 'mongoose';

import { IMessage } from '../interfaces/Message';

const MessageSchema = new Schema<IMessage>(
    {
        author: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        content: {
            type: String,
            required: true,
        },
        attachments: [
            {
                type: String,
                required: true,
                default: [],
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default model('Message', MessageSchema);
