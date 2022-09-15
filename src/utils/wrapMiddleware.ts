import { NextFunction, Request, Response } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const wrapMiddleWare =
    (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
    (
        socket: Socket<
            DefaultEventsMap,
            DefaultEventsMap,
            DefaultEventsMap,
            unknown
        >,
        next: (err?: ExtendedError | undefined) => void,
    ) =>
        middleware(
            socket.request as Request,
            {} as Response,
            next as NextFunction,
        );

export default wrapMiddleWare;
