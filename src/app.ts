import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import { globalErrorHandler } from './app/middleware/globalErrorHandlers';
import {sanitizeMiddleware} from "./app/middleware/sanitizeMiddleware";
import notFoundRoute from './app/middleware/notFoundRoute';
import { envVars } from './config/envVariable.config';

const app: Application = express();

// Middleware
app.use(cors({
    origin: [envVars.CLIENT_SITE_URL, 'http://localhost:3000'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);
app.use(cookieParser());


// default router after server is running
app.get('/', (_req: Request, res: Response) => {
    res.send({
        version: '1.0.6',
        message: 'Welcome to the Learning Management Backend Server is Running!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime().toFixed(2) + ' seconds'
    });
});

// initialize all router 
app.use('/api/v1', router);

// Global error handler middleware
app.use(globalErrorHandler);

// add not found route middleware
app.use(notFoundRoute);

export default app;