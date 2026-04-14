import { ResponseMessageOutput } from "../interface/output-response.interface"

export const SuccessMessageResponse = (message: string, data?: any): ResponseMessageOutput => {
    return {
        success: true,
        message: message || '',
        data: data || null
    }
}