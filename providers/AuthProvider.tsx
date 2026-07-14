"use client";

import { createContext, type ReactNode } from "react";
import type { AuthUserSummary, Profile } from "@/types/profile";

export type AuthContextValue = {
  isAuthenticated: boolean;
  profile: Profile | null;
  user: AuthUserSummary | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialProfile = null,
  initialUser = null,
}: {
  children: ReactNode;
  initialProfile?: Profile | null;
  initialUser?: AuthUserSummary | null;
}) {
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(initialUser),
        profile: initialProfile,
        user: initialUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
