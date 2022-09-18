import { Types } from 'mongoose';

import { BaseDocument } from './BaseDocument';

export interface IMessage extends BaseDocument {
    author: Types.ObjectId;
    content: string;
    attachments: string[];
}
