// src/App.test.tsx
import { render, screen } from "@testing-library/react";
import App from "./App";
import React from "react";

jest.mock("react-router-dom", () => ({
  __esModule: true,
  BrowserRouter: ({ children }: any) => children,
  Routes: ({ children }: any) => {
    return Array.isArray(children) ? children[0] : children;
  },
  Route: ({ element }: any) => element,
  useNavigate: () => jest.fn(),
  useParams: () => ({ fileId: "123" }),
}));

jest.mock("./Helpers/AuthContext", () => ({
  __esModule: true,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    user: { id: 1, name: "Test User" },
  }),
}));

jest.mock("./Pages/Accueil/Index", () => ({
  __esModule: true,
  default: () => <div>Login Page</div>,
}));

jest.mock("./Pages/Default/Index", () => ({
  __esModule: true,
  default: () => <div>Default Page</div>,
}));

jest.mock("./Pages/Connexion/Index", () => ({
  __esModule: true,
  default: () => <div>Connexion Page</div>,
}));

jest.mock("./Pages/Inscription", () => ({
  __esModule: true,
  default: () => <div>Register Page</div>,
}));

jest.mock("./Pages/UsersFiles/Index", () => ({
  __esModule: true,
  default: () => <div>User Files Page</div>,
}));

jest.mock("./Pages/DowloadFiles/Index", () => ({
  __esModule: true,
  default: () => <div>Download File Page</div>,
}));

//  Test principal
describe("App", () => {
  it("devrait rendre la page login sans erreur", () => {
    render(<App />);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
