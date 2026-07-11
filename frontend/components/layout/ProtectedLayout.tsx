"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/ui/Loader";

/**
 * Client-side route guard for authenticated pages (e.g. /feed).
 * Redirects to /login when there is no token after the session has
 * been hydrated. The backend remains the real authority — every API call
 * still requires a valid JWT.
 */
export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token, initialized } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!token) {
      setRedirecting(true);
      router.replace("/login");
    }
  }, [initialized, token, router]);

  if (!initialized || !token || redirecting) {
    return <Loader fullScreen label="Loading your feed..." />;
  }

  return <>{children}</>;
}
