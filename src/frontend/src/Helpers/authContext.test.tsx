import React from "react";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

// Composant de test pour accéder au contexte
const TestComponent = () => {
  const { authState, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="status">{authState.status ? "true" : "false"}</span>
      <span data-testid="firstname">{authState.firstname}</span>

      <button onClick={() => login({ firstname: "Jean", lastname: "Dupont", id: 1 })}>login</button>

      <button onClick={logout}>logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("état initial par défaut", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("status").textContent).toBe("false");
    expect(screen.getByTestId("firstname").textContent).toBe("");
  });

  test("login met à jour l'état et le localStorage", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText("login").click();
    });

    expect(screen.getByTestId("status").textContent).toBe("true");
    expect(screen.getByTestId("firstname").textContent).toBe("Jean");

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    expect(storedUser.firstname).toBe("Jean");
    expect(storedUser.lastname).toBe("Dupont");
    expect(storedUser.status).toBe(true);
  });

  test("logout réinitialise l'état et supprime le localStorage", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login d'abord
    act(() => {
      screen.getByText("login").click();
    });

    // Puis logout
    act(() => {
      screen.getByText("logout").click();
    });

    expect(screen.getByTestId("status").textContent).toBe("false");
    expect(screen.getByTestId("firstname").textContent).toBe("");
    expect(localStorage.getItem("user")).toBeNull();
  });

  test("useAuth hors AuthProvider déclenche une erreur", () => {
    const ErrorComponent = () => {
      useAuth();
      return null;
    };

    expect(() => render(<ErrorComponent />)).toThrow("useAuth doit être utilisé dans un AuthProvider");
  });
});
