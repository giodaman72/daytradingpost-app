export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export type ApiError = {
  code: ApiErrorCode;
  details?: Record<string, unknown>;
  message: string;
};

export type ApiSuccess<T> = {
  data: T;
  ok: true;
};

export type ApiFailure = {
  error: ApiError;
  ok: false;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PaginatedResponse<T> = ApiSuccess<T[]> & {
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    limit: number;
  };
};
