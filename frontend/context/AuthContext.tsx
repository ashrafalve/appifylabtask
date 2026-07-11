"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authService, setAccessToken } from "@/lib/api";
import type { AuthResult, User } from "@/lib/types";

/**
 * AuthContext
 * ------------
 * Holds the authenticated `user` + JWT `token` and exposes
 * `login` / `register` / `logout`. The token is persisted in
 * localStorage (see lib/api/client.ts) so the session survives a refresh,
 * while the bearer header is attached to every request by the axios
 * interceptor.
 *
 * Security notes:
 *  - This is a client-rendered SPA-style guard. Route protection is
 *    enforced through <ProtectedLayout>, but the *real* authorization is the
 *    backend (every endpoint requires a valid JWT). Treat the frontend guard
 *    as UX, not a security boundary.
 *  - We intentionally do not store the raw token in any accessible global
 *    beyond localStorage; nothing secret is exposed to the UI.
 */

const TOKEN_KEY = "buddy_token";
const USER_KEY = "buddy_user";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  /** True once we've read the persisted session on mount. */
  initialized: boolean;
  /** True while a login/register request is in flight. */
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readPersisted(): { token: string | null; user: User | null } {
  if (typeof window === "undefined") return { token: null, user: null };
  const token = window.localStorage.getItem(TOKEN_KEY);
  let user: User | null = null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (raw) user = JSON.parse(raw) as User;
  } catch {
    user = null;
  }
  return { token, user };
}

function persist(token: string | null, user: User | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hydrate from localStorage on first mount, then refresh the user profile.
  useEffect(() => {
    const persisted = readPersisted();
    setToken(persisted.token);
    setUser(persisted.user);
    setInitialized(true);

    if (persisted.token) {
      authService
        .getMe()
        .then((fresh) => setUser(fresh))
        .catch(() => {
          // Token may be expired/invalid - clear the session.
          setAccessToken(null);
          persist(null, null);
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  const applySession = useCallback((result: AuthResult) => {
    setAccessToken(result.tokens.accessToken);
    persist(result.tokens.accessToken, result.user);
    setToken(result.tokens.accessToken);
    setUser(result.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const result = await authService.login({ email, password });
        applySession(result);
      } finally {
        setLoading(false);
      }
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      setLoading(true);
      try {
        const result = await authService.register(payload);
        applySession(result);
      } finally {
        setLoading(false);
      }
    },
    [applySession],
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    persist(null, null);
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initialized,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token, initialized, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
