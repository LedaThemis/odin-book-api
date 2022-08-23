import { Schema, Types, model } from 'mongoose';

const CommentSchema = new Schema(
    {
        content: { type: String, required: true },
        author: { type: Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    },
);

export default model('Comment', CommentSchema);
