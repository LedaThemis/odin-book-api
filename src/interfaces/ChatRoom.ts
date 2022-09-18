import { Types } from 'mongoose';

import { BaseDocument } from './BaseDocument';

export interface IChatRoom extends BaseDocument {
    members: Types.ObjectId[];
    messages: Types.ObjectId[];
}
