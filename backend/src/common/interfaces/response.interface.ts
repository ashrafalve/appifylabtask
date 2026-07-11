/**
 * Generic API response envelope. All successful responses are wrapped in this
 * shape so the frontend can rely on a single, predictable contract.
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

/**
 * Paginated payload wrapper. `meta` carries everything the client needs to
 * build pagination controls without guessing.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export type ApiPaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
