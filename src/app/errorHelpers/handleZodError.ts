/* eslint-disable @typescript-eslint/no-explicit-any */

import { IErrorSource } from "../types/error.types";




export const handleZodError = (error: any) => {
    const errorSources: IErrorSource[] = [];
    error.issues.forEach((issue: any) => {
        errorSources.push({
            field: issue.path[issue.path.length - 1],
            message: issue.message
        })
    });
    return {
        statusCode: 400,
        message: 'Zod Validation Error',
        errorSources: errorSources,
    }
};