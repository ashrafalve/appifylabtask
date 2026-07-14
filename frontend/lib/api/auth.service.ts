import { api } from "@/lib/api/client";
import type { AuthResult, User } from "@/lib/types";

/**
 * Authentication service.
 *
 *  POST /auth/register  { firstName, lastName, email, password }
 *  POST /auth/login     { email, password }
 *  GET  /users/me       -> User
 *
 * All responses are unwrapped by the axios interceptor, so `api.post`
 * resolves directly to the payload `{ user, tokens }` / `User`.
 */

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResult> {
    return api.post("/auth/register", payload) as Promise<AuthResult>;
  },

  async login(payload: LoginPayload): Promise<AuthResult> {
    return api.post("/auth/login", payload) as Promise<AuthResult>;
  },

  async getMe(): Promise<User> {
    return api.get("/users/me") as Promise<User>;
  },
};
