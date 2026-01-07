// src/Pages/Connexion/Connexion.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import Connexion from "./Index";

// Mock des dépendances
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => jest.fn(),
}));

jest.mock("../../Helpers/AuthContext", () => ({
  __esModule: true,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    user: { id: 1, name: "Test User" },
  }),
}));

jest.mock("../../Components/Header/Index", () => ({
  __esModule: true,
  default: () => <div>Header Mock</div>,
}));

jest.mock("../../Components/Footer/Index", () => ({
  __esModule: true,
  default: () => <div>Footer Mock</div>,
}));

// Test principal
describe("Connexion Component", () => {
  it("devrait rendre le formulaire avec les champs email et mot de passe", () => {
    render(<Connexion />);

    // Vérifie que les labels et placeholders sont rendus
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();

    // Vérifie que le header et footer mocks sont présents
    expect(screen.getByText("Header Mock")).toBeInTheDocument();
    expect(screen.getByText("Footer Mock")).toBeInTheDocument();

    // Vérifie que le bouton submit est présent
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();

    // Vérifie le lien "Créer un compte"
    expect(screen.getByText(/créer un compte/i)).toBeInTheDocument();
  });

  it("permet de taper dans les champs email et mot de passe", async () => {
    const user = userEvent.setup();
    render(<Connexion />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "mypassword");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("mypassword");
  });
});
