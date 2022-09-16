import { Types } from 'mongoose';

import { BaseDocument } from './BaseDocument';

export interface IUser extends BaseDocument {
    id: string;
    displayName: string;
    photoURL: string;
    friends: Types.ObjectId[];
    incomingFriendRequests: Types.ObjectId[];
    custom: {
        photoURL: string;
    };
    guest?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
