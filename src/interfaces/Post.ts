import { Types } from 'mongoose';

import { IUser } from './User';

export interface IPost {
    content: string;
    photos: Types.ObjectId[];
    author: Types.ObjectId | IUser;
    comments: Types.ObjectId[];
    likes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
