import { Types } from 'mongoose';

import { IUser } from '../interfaces/User';

const areFriends = (
    user1: { friends: IUser[] | Types.ObjectId[] },
    user2: IUser,
) => user1.friends.some((u) => u._id.equals(user2._id));

export default areFriends;
