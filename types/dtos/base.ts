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

export const toQueryString = (params?: PageRequest): string => {
    const searchParams = new URLSearchParams();
    if (!params) return ""
    // 1. Xử lý page (Lưu ý: kiểm tra undefined vì page có thể là 0)
    if (params.page !== undefined && params.page !== null) {
        searchParams.append('page', params.page.toString());
    }

    // 2. Xử lý size
    if (params.size !== undefined && params.size !== null) {
        searchParams.append('size', params.size.toString());
    }

    // 3. Xử lý filter (tự động encode URL)
    if (params.filter) {
        searchParams.append('filter', params.filter);
    }

    // 4. Xử lý sort (Mảng string)
    // Spring Boot thường nhận: ?sort=name,asc&sort=date,desc
    if (params.sort && params.sort.length > 0) {
        params.sort.forEach((item) => {
            searchParams.append('sort', item);
        });
    }

    return searchParams.toString();
};