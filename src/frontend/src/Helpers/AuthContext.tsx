import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthState {
  firstname: string;
  lastname: string;
  id: number;
  photo_: string;
  login: string;
  status: boolean;
}

interface AuthContextType {
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  login: (userData: Partial<AuthState>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    firstname: "",
    lastname: "",
    id: 0,
    photo_: "",
    login: "",
    status: false,
  });

  const login = (userData: Partial<AuthState>) => {
    setAuthState((prev) => ({
      ...prev,
      ...userData,
      status: true,
    }));

    localStorage.setItem("user", JSON.stringify({ ...authState, ...userData, status: true }));
  };

  const logout = () => {
    setAuthState({
      firstname: "",
      lastname: "",
      id: 0,
      photo_: "",
      login: "",
      status: false,
    });

    localStorage.removeItem("user");
  };

  return <AuthContext.Provider value={{ authState, setAuthState, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
