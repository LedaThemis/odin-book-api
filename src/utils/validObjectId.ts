import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

const validObjectId = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!Types.ObjectId.isValid(req.params[paramName])) {
            return res.sendStatus(400);
        }

        next();
    };
};

export default validObjectId;
