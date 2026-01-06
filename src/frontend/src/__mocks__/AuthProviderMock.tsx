// src/__tests__/__mocks__/AuthProviderMock.tsx
import React, { ReactNode } from "react";
import { AuthProvider } from "../Helpers/AuthContext";

export const AuthProviderMock: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
