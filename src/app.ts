import compression from 'compression';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import http from 'http';
import mongoose from 'mongoose';
import logger from 'morgan';
import passport from 'passport';
import { Server } from 'socket.io';

import { googleStrategy } from './auth';
import commentsRouter from './routes/comments';
import indexRouter from './routes/index';
import postsRouter from './routes/posts';
import usersRouter from './routes/users';
import wrap from './utils/wrapMiddleware';

dotenv.config();

// Database
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Express
const app = express();

// HTTP Server
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
    serveClient: false,
    cors: {
        origin: 'http://localhost:3000',
    },
});

// Socket.io Middleware
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.request.user._id.toString()}`);

    // Join to room of user id
    socket.join(socket.request.user._id.toString());
});

io.on('disconnect', (socket) => {
    console.log(`User disconnected: ${socket.request.user._id.toString()}`);
});

// CORS
app.use(cors());

// Passport
passport.use(googleStrategy);

const sessionMiddleware = session({
    secret: process.env['SECRET_KEY'],
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
    }),
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/users', usersRouter);

// Socket.io middleware
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
    if (socket.request.user) {
        next();
    } else {
        next(new Error('Unauthorized'));
    }
});

export { app, server, io };
