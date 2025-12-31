/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';

const notFoundRoute = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).send({
        success: false,
        message: 'The requested route does not exist.',
        statusCode: 404,
        error: {
            path: req.originalUrl,
            method: req.method,
            message: 'Your request url or method is incorrect.'
        }
    });
}

export default notFoundRoute;