export interface Page<T>{
    page: number,
    size: number,
    totalElements: number,
    totalPages: number,
    numberOfElements: number,
    content: T[]
}

export interface Base{
    id: number,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string,
}
export interface BaseResponse{

}

export interface ErrorResponse {
    message: string;
    statusCode: number;
}

export interface PageRequest {
    filter?: string;
    page?: number;
    size?: number;
    sort?: string[];
}