import { PaginatedResponse } from '@shared/schema/common.schema';

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export interface ApiPaginatedResponse<T> {
  message: string;
  data: PaginatedResponse<T>;
}

export class ApiResponseBuilder {
  static success<T>(data: T, message: string): ApiResponse<T> {
    return {
      message,
      data,
    };
  }

  static successMessage(message: string): Omit<ApiResponse<never>, 'data'> {
    return {
      message,
    };
  }

  static paginated<T>(
    paginatedData: PaginatedResponse<T>,
    message: string,
  ): ApiPaginatedResponse<T> {
    return {
      message,
      data: paginatedData,
    };
  }
}
