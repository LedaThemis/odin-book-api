import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy } from 'passport-google-oauth20';

import { IUser } from '../interfaces/User';
import User from '../models/User';

dotenv.config();

export const googleStrategy = new Strategy(
    {
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
        callbackURL: process.env['GOOGLE_CALLBACK_URL'],
        scope: ['profile'],
        state: true,
    },
    function (accessToken, refreshToken, profile, cb) {
        User.findOne({ id: profile.id }).exec(async (err, user) => {
            if (err) {
                return cb(err);
            }

            if (!user) {
                const photoURL = profile.photos
                    ? profile.photos[0].value
                    : 'https://via.placeholder.com/96';

                User.create(
                    {
                        displayName: profile.displayName,
                        photoURL,
                    },
                    (err, user) => {
                        if (err) {
                            return cb(err);
                        }

                        return cb(null, user);
                    },
                );
            } else {
                cb(null, user);
            }
        });
    },
);

passport.serializeUser(function (user, done) {
    done(null, user._id);
});
passport.deserializeUser(function (_id, done) {
    User.findById(_id, function (err: Error | null, user: IUser) {
        done(err, user);
    });
});
