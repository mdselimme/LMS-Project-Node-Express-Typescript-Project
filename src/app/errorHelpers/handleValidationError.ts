/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { IErrorSource, IGenericErrorResponse } from "../types/error.types";


export const handleValidationError = (err: mongoose.Error.ValidationError): IGenericErrorResponse => {

    const errorSources: IErrorSource[] = [];
    const errors = Object.values(err.errors);

    errors.forEach((errObj: any) => errorSources.push({
        field: errObj.path,
        message: errObj.message
    }));
    return {
        statusCode: 400,
        message: "Validation Error.",
        errorSources
    }
};