"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/** Root route: send logged-in users to the feed, others to login. */
export default function HomePage() {
  const { token, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    router.replace(token ? "/feed" : "/login");
  }, [initialized, token, router]);

  return null;
}
