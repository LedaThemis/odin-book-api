import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

const validateErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            state: 'failed',
            errors: errors.array(),
        });
    }

    // If there are no errors
    next();
};

export default validateErrors;
