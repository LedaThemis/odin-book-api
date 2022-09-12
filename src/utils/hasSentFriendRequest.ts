import { Types } from 'mongoose';

const hasSentFriendRequest = (
    sender: { _id: Types.ObjectId },
    recipient: { incomingFriendRequests: Types.ObjectId[] },
) => recipient.incomingFriendRequests.some((u) => u.equals(sender._id));

export default hasSentFriendRequest;
