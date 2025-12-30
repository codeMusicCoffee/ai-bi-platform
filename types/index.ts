export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}
