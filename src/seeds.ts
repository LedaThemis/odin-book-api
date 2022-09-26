import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';

import { IUser } from './interfaces/User';
import Post from './models/Post';
import User from './models/User';

dotenv.config();

// Database
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// CONSTANTS
const guestUsersCount = 10;
const minPostsPerUser = 2;
const maxPostsPerUser = 5;

const generateUser = async () => {
    const user = new User({
        id: '0',
        displayName: faker.helpers.unique(faker.name.fullName),
        photoURL: faker.helpers.unique(faker.internet.avatar),
        guest: true,
    });

    const savedUser = await user.save();

    return savedUser;
};

const generatePost = async (author: Types.ObjectId) => {
    const post = new Post({
        content: faker.lorem.lines(),
        photos: [
            faker.image.lorempicsum.imageUrl(
                640,
                480,
                false,
                undefined,
                faker.helpers.unique(faker.random.alphaNumeric),
            ),
        ],
        author,
    });

    const savedPost = await post.save();

    return savedPost;
};

const createGuestUserWithPosts = async () => {
    const user = await generateUser();

    console.log(`${user.displayName}: Created user.`);

    const numOfPosts = faker.mersenne.rand(minPostsPerUser, maxPostsPerUser);

    console.log(`${user.displayName}: Posting ${numOfPosts} posts...`);

    for (let i = 1; i <= numOfPosts; i++) {
        await generatePost(user._id);
    }

    console.log(`${user.displayName}: Posted ${numOfPosts} posts.`);

    return user;
};

type UserType = mongoose.Document<unknown, unknown, IUser> &
    IUser &
    Required<{
        _id: Types.ObjectId;
    }>;

const friendUsersFromList = async (user: UserType, users: UserType[]) => {
    const randomFriends = faker.helpers.arrayElements(users);

    user.friends.push(
        ...randomFriends
            .map((u) => u._id)
            .filter((id) => !user.friends.includes(id)),
    );

    for (let i = 0; i < randomFriends.length; i++) {
        if (!randomFriends[i].friends.includes(user._id)) {
            randomFriends[i].friends.push(user._id);

            await randomFriends[i].save();
        }
    }

    const savedUser = await user.save();

    console.log(
        `${user.displayName}: Added ${randomFriends.length} friend${
            randomFriends.length > 1 ? 's' : ''
        }`,
    );

    return savedUser;
};

const likeGuestPosts = async (author: UserType) => {
    const userPosts = await Post.find({ author: author._id });

    for (let i = 0; i < userPosts.length; i++) {
        userPosts[i].likes = faker.helpers.arrayElements(author.friends);

        await userPosts[i].save();
    }

    console.log(`${author.displayName}: Added likes to user posts.`);
};

const main = async () => {
    try {
        // Get guest users
        const guests = await User.find({ guest: true }, '_id');

        // Clear past guest users' posts
        await Post.deleteMany({ author: { $in: guests.map((u) => u._id) } });

        console.log('INFO: Cleared old posts.');

        // Clear past guest users
        await User.deleteMany({ guest: true });

        console.log('INFO: Cleared old users.');

        const guestUsers: UserType[] = [];

        for (let i = 1; i <= guestUsersCount; i++) {
            const user = await createGuestUserWithPosts();
            guestUsers.push(user);
        }

        for (let i = 0; i < guestUsers.length; i++) {
            await friendUsersFromList(
                guestUsers[i],
                guestUsers.filter((u) => !u._id.equals(guestUsers[i]._id)),
            );
        }

        for (let i = 0; i < guestUsers.length; i++) {
            await likeGuestPosts(guestUsers[i]);
        }

        process.exit();
    } catch (e) {
        console.error(e);
    }
};

main();
