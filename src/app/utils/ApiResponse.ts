import { Response } from "express"
interface IMeta {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
};

interface IApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
    statusCode: number;
    meta?: IMeta;
};

// Generic API Response Function
const ApiResponse = <T>(res: Response, data: IApiResponse<T>) => {
    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        data: data.data,
        message: data.message,
        success: data.success,
        meta: data.meta,
    });
};

export default ApiResponse;