import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "@/lib/utils/errors";
import { API_BASE_URL } from "@/lib/utils/format";

/**
 * Centralized Axios client.
 *
 * Responsibilities:
 *  - Prefix every request with NEXT_PUBLIC_API_BASE_URL (never hardcoded).
 *  - Attach the JWT as `Authorization: Bearer <token>` read from
 *    localStorage on each request (so a freshly logged-in token is used
 *    immediately, without a reload).
 *  - Unwrap the backend envelope `{ ..., data }` so service code works
 *    directly with the payload.
 *  - Normalize errors into `ApiError` so the UI has one shape to catch.
 */

const TOKEN_KEY = "buddy_token";

/** Read the access token (kept in localStorage by the auth layer). */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  validateStatus: () => true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

interface Envelope<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

api.interceptors.response.use(
  (response) => {
    const body = response.data as Envelope;
    if (body && typeof body === "object" && "data" in body) {
      return body.data as any;
    }
    return response as any;
  },
  (error: AxiosError<Envelope>) => {
    const response = error.response;
    const body = response?.data;

    const message =
      body?.message ||
      (response
        ? `Request failed with status ${response.status}`
        : "Network error - please check your connection");

    const statusCode = response?.status;
    const fieldErrors = (body as { errors?: Record<string, string[] | string> } | undefined)
      ?.errors;

    return Promise.reject(new ApiError(message, statusCode, fieldErrors));
  },
);

export { api };
