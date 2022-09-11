import { Schema, model } from 'mongoose';

import { IComment } from '../interfaces/Comment';

const CommentSchema = new Schema<IComment>(
    {
        content: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    },
);

export default model('Comment', CommentSchema);
