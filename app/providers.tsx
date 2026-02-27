"use client";

/**
 * App providers: SessionProvider for NextAuth so client components can use useSession().
 */
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
