import { Types } from 'mongoose';

import { BaseDocument } from './BaseDocument';

export interface IPost extends BaseDocument {
    content: string;
    photos: string[];
    author: Types.ObjectId;
    comments: Types.ObjectId[];
    likes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
