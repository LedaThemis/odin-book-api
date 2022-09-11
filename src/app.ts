import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import mongoose from 'mongoose';
import logger from 'morgan';
import passport from 'passport';

import { googleStrategy } from './auth';
import commentsRouter from './routes/comments';
import indexRouter from './routes/index';
import postsRouter from './routes/posts';

dotenv.config();

// Database
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Express
const app = express();

// CORS
app.use(cors());

// Passport
passport.use(googleStrategy);

// Middleware
app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(
    session({
        secret: process.env['SECRET_KEY'],
        resave: false,
        saveUninitialized: true,
    }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);

export default app;
