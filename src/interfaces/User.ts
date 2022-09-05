import { Types } from 'mongoose';

export interface IUser {
    id: string;
    displayName: string;
    photoURL: string;
    friends: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
