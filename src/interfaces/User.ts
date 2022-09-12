import { Types } from 'mongoose';

import { BaseDocument } from './BaseDocument';

export interface IUser extends BaseDocument {
    id: string;
    displayName: string;
    photoURL: string;
    friends: Types.ObjectId[];
    incomingFriendsRequests: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
