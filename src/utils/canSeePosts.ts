import { Types } from 'mongoose';

import { IUser } from '../interfaces/User';
import areFriends from './areFriends';
import areSameUser from './areSameUser';

const canSeePosts = (
    user1: { _id: Types.ObjectId; friends: IUser[] },
    user2: IUser,
) => areSameUser(user1, user2) || areFriends(user1, user2);

export default canSeePosts;
