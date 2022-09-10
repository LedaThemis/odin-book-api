import { NextFunction, Request, Response } from 'express';

export function index(req: Request, res: Response) {
    return res.sendStatus(200);
}
export const get_current_user_details = (req: Request, res: Response) => {
    return res.json({
        user: req.user,
    });
};

export const get_user_unauthenicated = (req: Request, res: Response) => {
    return res.json({
        state: 'failed',
        errors: [
            {
                msg: 'You are unauthenticated.',
            },
        ],
    });
};

export const post_logout_user = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    req.logout((err) => {
        if (err) return next(err);

        return res.sendStatus(200);
    });
};
