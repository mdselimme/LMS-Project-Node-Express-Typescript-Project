/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose"
import { IGenericErrorResponse } from "../types/error.types"



export const handlerCastError = (err: mongoose.Error.CastError): IGenericErrorResponse => {

    return {
        statusCode: 400,
        message: "Invalid MongoDb ObjectId. Pleas give a valid id."
    }
}