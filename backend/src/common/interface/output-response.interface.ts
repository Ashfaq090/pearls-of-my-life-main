export class ResponseMessageOutput<T = any> {
    success: boolean;
    message: string;
    data?: T;
}