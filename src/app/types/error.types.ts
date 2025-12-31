
export interface IErrorSource {
    field: string;
    message: string;
};

export interface IGenericErrorResponse {
    statusCode: number;
    message: string;
    errorSources?: IErrorSource[];
};
