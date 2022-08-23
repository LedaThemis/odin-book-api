import { Schema, Types, model } from 'mongoose';

const PostSchema = new Schema(
    {
        content: { type: String, required: true },
        photos: [{ type: String, required: true }],
        author: { type: Types.ObjectId, ref: 'User', required: true },
        comments: [{ type: Types.ObjectId, ref: 'Comment', required: true }],
        likes: [{ type: Types.ObjectId, ref: 'User', required: true }],
    },
    {
        timestamps: true,
    },
);

export default model('Post', PostSchema);
