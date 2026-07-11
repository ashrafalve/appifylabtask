/**
 * Normalized client-side error.
 *
 * Thrown by the axios response interceptor (lib/api/client.ts) so that UI
 * code can rely on a single, predictable shape instead of poking at
 * axios `AxiosError` internals. `statusCode` mirrors the backend's
 * `statusCode` (401, 409, 422, ...) and `fieldErrors` carries
 * per-field validation messages when the backend emits them.
 */
export class ApiError extends Error {
  statusCode?: number;
  fieldErrors?: Record<string, string[] | string>;

  constructor(
    message: string,
    statusCode?: number,
    fieldErrors?: Record<string, string[] | string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}
