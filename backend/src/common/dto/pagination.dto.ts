import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Reusable cursor-free offset pagination query. Inheritable by any list endpoint.
 * Defaults to page 1 / limit 10 and clamps values to sane bounds.
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

/**
 * Derives skip/take and normalized page/limit from a PaginationDto.
 */
export function resolvePagination(dto: PaginationDto): PaginationParams {
  const page = dto.page && dto.page > 0 ? dto.page : 1;
  const limit = dto.limit && dto.limit > 0 ? Math.min(dto.limit, 100) : 10;
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Builds the standard pagination meta block from the total row count.
 */
export function buildPaginationMeta(
  params: PaginationParams,
  total: number,
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  const totalPages = Math.ceil(total / params.limit);
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
}
