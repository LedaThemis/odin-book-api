import { IUser } from './src/interface/User';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            MONGODB_URI: string;
            SECRET_KEY: string;
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            GOOGLE_CALLBACK_URL: string;
            CLIENT_REDIRECT_URL: string;
        }
    }
    namespace Express {
        type User = IUser;
        interface Request {
            User: Express.User;
        }
    }
}

export {};
