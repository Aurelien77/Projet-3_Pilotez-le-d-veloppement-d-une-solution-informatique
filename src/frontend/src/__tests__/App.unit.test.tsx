import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

// Tous les mocks
jest.mock("../Pages/Accueil/Index", () => ({
  __esModule: true,
  default: () => <div>Mocked Login</div>,
}));

describe("App - Tests unitaires", () => {
  it("devrait router correctement", () => {});
});
