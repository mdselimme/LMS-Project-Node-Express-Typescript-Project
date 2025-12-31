/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGenericErrorResponse } from "../types/error.types";


export const handleDuplicateError = (error: any): IGenericErrorResponse => {
    const matchedArray = error.message.match(/"([^"]*)"/);
    return {
        message: `${matchedArray[1]} already exist.`,
        statusCode: 400,
    }
}
