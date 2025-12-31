/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { IErrorSource } from "../types/error.types";
import { handleZodError } from "../errorHelpers/handleZodError";
import { handleDuplicateError } from "../errorHelpers/handleDuplicateError";
import ApiError from "../utils/ApiError";
import { handlerCastError } from "../errorHelpers/handleCastError";
import { handleValidationError } from "../errorHelpers/handleValidationError";
import { envVars } from "../../config/envVariable.config";



//GLOBAL ERROR HANDLER MIDDLEWARE
export const globalErrorHandler = async (error: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === 'development') {
        console.error("Error Details:", error);
    };

    let errorSources: IErrorSource[] = [];
    let statusCode = 500;
    let message = `Something went wrong on the server. Please try again later!! ${error.message || ''}`;

    //Duplicate Key Error
    if (error.code === 11000) {
        const simplifiedError = handleDuplicateError(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Mongoose Cast Error 
    else if (error.name === "CastError") {
        const simplifiedError = handlerCastError(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Validation Error 
    else if (error.name === "ValidationError") {
        const simplifiedError = handleValidationError(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as IErrorSource[];
    }
    //Zod Validation Error
    else if (error.name === 'ZodError') {
        const simplifiedError = handleZodError(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    // App Error Message 
    else if (error instanceof ApiError) {
        statusCode = error.statusCode
        message = error.message
    }
    // Error Message 
    else if (error instanceof Error) {
        statusCode = 500
        message = error.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        error: envVars.NODE_ENV === 'development' ? error : null,
        stack: envVars.NODE_ENV === 'development' ? error.stack : null,
    });

}