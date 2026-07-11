import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buddy Script",
  description: "Buddy Script social feed - frontend",
};

/**
 * Root layout.
 *
 * The design loads Poppins + its own stylesheet stack (Bootstrap, common,
 * main, responsive). We attach those via <link> tags pointing at the
 * copied assets under /public/assets so the rendered UI is pixel-identical
 * to the provided HTML. AuthProvider wraps the tree to expose the session
 * to every client component.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="_buddy_root">
      <head>
        <link rel="icon" href="/assets/images/logo-copy.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/common.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <link rel="stylesheet" href="/assets/css/responsive.css" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
