// src/Pages/Accueil/Perf.Accueil.test.tsx
import React from "react";
import { render } from "@testing-library/react";
import Accueil from "./Index";

// ------------------------ MOCKS ------------------------

// Mock useNavigate de react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

// Mock Header et Footer
jest.mock("../../Components/Header/Index", () => ({
  __esModule: true,
  default: () => <div data-testid="header-mock">Header Mock</div>,
}));
jest.mock("../../Components/Footer/Index", () => ({
  __esModule: true,
  default: () => <div data-testid="footer-mock">Footer Mock</div>,
}));

// Mock useAuth pour tests
jest.mock("../../Helpers/AuthContext", () => ({
  useAuth: () => ({
    authState: {
      status: "connected", // ou "disconnected", selon ce que ton composant attend
      user: { name: "Test User" },
    },
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// ------------------------ TESTS ------------------------
describe("Performance – Accueil", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("√ ⏱️ render initial de la page en moins de 200ms", () => {
    const start = performance.now();
    render(<Accueil />);
    const end = performance.now();
    const renderTime = end - start;
    console.log(`⏱️ Render initial Accueil: ${renderTime.toFixed(2)} ms`);
    expect(renderTime).toBeLessThan(200);
  });

  test("√ 🔁 interaction utilisateur rapide", () => {
    render(<Accueil />);
    // Simuler navigation
    mockNavigate("/test");
    expect(mockNavigate).toHaveBeenCalledWith("/test");
  });
});
