import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from './models/User';

dotenv.config();

// Database
mongoose.connect('mongodb://127.0.0.1:27017/odin-book');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

for (let i = 0; i < 10; i++) {
    const user = new User({
        id: '0',
        displayName: faker.name.fullName(),
        photoURL: faker.internet.avatar(),
        guest: true,
    });

    user.save((err, savedUser) => {
        if (err) {
            console.log(err);
        } else {
            console.log(
                `${i + 1}. Successfully saved ${savedUser.displayName}`,
            );
        }
    });
}
