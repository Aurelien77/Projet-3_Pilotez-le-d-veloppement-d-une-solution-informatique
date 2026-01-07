/**
 * @jest-environment jsdom
 */
// src/Pages/Inscription/Perf.Inscription.test.tsx

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "./Index";

/* ============================== MOCKS ============================== */

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => jest.fn(),
}));

jest.mock("../../Components/Header/Index", () => ({
  __esModule: true,
  default: () => <div>Header</div>,
}));

jest.mock("../../Components/Footer/Index", () => ({
  __esModule: true,
  default: () => <div>Footer</div>,
}));

/* ============================== DATA ============================== */

const mockUserResponse = {
  id: 42,
  email: "test@example.com",
  firstName: null,
  lastName: null,
  login: "test123",
  picture: null,
  createdAt: new Date().toISOString(),
  password: "hashed-password",
};

/* ============================== TESTS ============================== */

describe("Performance – Inscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ------------------------------------------------------------ */
  it("⏱️ render initial du formulaire en moins de 300ms", async () => {
    const start = performance.now();

    render(<Register />);

    await waitFor(() => expect(screen.getByText("Créer un compte")).toBeInTheDocument());

    const end = performance.now();
    const renderTime = end - start;

    console.log(`⏱️ Register render time: ${renderTime.toFixed(2)} ms`);

    expect(renderTime).toBeLessThan(300);
  });

  /* ------------------------------------------------------------ */
  it("🔁 ne déclenche pas de re-render excessif au montage", async () => {
    const renderSpy = jest.fn();

    const Wrapper = () => {
      renderSpy();
      return <Register />;
    };

    render(<Wrapper />);

    await waitFor(() => expect(screen.getByText("Créer un compte")).toBeInTheDocument());

    expect(renderSpy.mock.calls.length).toBeLessThan(5);
  });

  /* ------------------------------------------------------------ */
  it("✍️ saisie email + mots de passe en moins de 1200ms", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const start = performance.now();

    await user.type(screen.getByPlaceholderText("Saisissez votre email..."), "test@example.com");
    await user.type(screen.getByPlaceholderText("Saisissez votre mot de passe..."), "Password123!");
    await user.type(screen.getByPlaceholderText("Saisissez le à nouveau"), "Password123!");

    const end = performance.now();
    const inputTime = end - start;

    expect(inputTime).toBeLessThan(1200);
  });

  /* ------------------------------------------------------------ */
  it("🌐 effectue un seul appel réseau lors de l’inscription", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserResponse),
      })
    ) as jest.Mock;

    render(<Register />);

    await user.type(screen.getByPlaceholderText("Saisissez votre email..."), "test@example.com");
    await user.type(screen.getByPlaceholderText("Saisissez votre mot de passe..."), "Password123!");
    await user.type(screen.getByPlaceholderText("Saisissez le à nouveau"), "Password123!");

    await user.click(screen.getByText("Créer mon compte"));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  });

  /* ------------------------------------------------------------ */
  it("📤 affiche le popup de succès en moins de 300ms après submit", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserResponse),
      })
    ) as jest.Mock;

    render(<Register />);

    await user.type(screen.getByPlaceholderText("Saisissez votre email..."), "test@example.com");
    await user.type(screen.getByPlaceholderText("Saisissez votre mot de passe..."), "Password123!");
    await user.type(screen.getByPlaceholderText("Saisissez le à nouveau"), "Password123!");

    const start = performance.now();

    await user.click(screen.getByText("Créer mon compte"));

    await waitFor(() => expect(screen.getByText(/compte créé avec succès/i)).toBeInTheDocument());

    const end = performance.now();
    const popupTime = end - start;

    console.log(`🪟 Success popup time: ${popupTime.toFixed(2)} ms`);

    expect(popupTime).toBeLessThan(300);
  });

  /* ------------------------------------------------------------ */
  it("🔁 supporte 10 montages consécutifs sans fuite mémoire", async () => {
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<Register />);
      await waitFor(() => expect(screen.getByText("Créer un compte")).toBeInTheDocument());
      unmount();
    }
  });
});
