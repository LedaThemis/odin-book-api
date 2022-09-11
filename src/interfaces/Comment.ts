import { Types } from 'mongoose';

import { BaseDocument } from './BaseDocument';

export interface IComment extends BaseDocument {
    content: string;
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
