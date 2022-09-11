import { Types } from 'mongoose';

export interface BaseDocument {
    _id: Types.ObjectId;
    __v: 0;
}
