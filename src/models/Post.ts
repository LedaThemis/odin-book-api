import { Schema, model } from 'mongoose';

import { IPost } from '../interfaces/Post';

const PostSchema = new Schema<IPost>(
    {
        content: { type: String, required: true },
        photos: [{ type: String, required: true }],
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
                required: true,
                default: [],
            },
        ],
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
                default: [],
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default model('Post', PostSchema);
