export interface Page<T>{
    id: number,
    size: number,
    totalElements: number,
    numberOfElements: number,
    content: T[]
}

export interface Base{
    id: number,
    createdAt: Date,
    updatedAt: Date,
    createdBy: string,
    updatedBy: string,
}
export interface BaseResponse{

}