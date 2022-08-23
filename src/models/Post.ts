import { Schema, Types, model } from 'mongoose';

interface IPost {
    content: string;
    photos: Types.ObjectId[];
    author: Types.ObjectId;
    comments: Types.ObjectId[];
    likes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
    {
        content: { type: String, required: true },
        photos: [{ type: String, required: true }],
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        comments: [
            { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
        ],
        likes: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    },
    {
        timestamps: true,
    },
);

export default model('Post', PostSchema);
