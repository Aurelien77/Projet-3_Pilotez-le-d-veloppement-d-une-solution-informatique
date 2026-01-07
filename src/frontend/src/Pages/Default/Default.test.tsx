// src/Pages/Default/Default.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Default from "./Index";

// Mock de useNavigate de react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

describe("Default Page", () => {
  beforeEach(() => {
    mockNavigate.mockClear(); // Reset du mock avant chaque test
  });

  test("renders Default page", () => {
    const { getByTestId, getByText } = render(<Default />);
    expect(getByTestId("default-page")).toBeInTheDocument();
    expect(getByText("Retour à la page d'accueil")).toBeInTheDocument();
    expect(getByText("Cliquez ici pour revenir à l'accueil")).toBeInTheDocument();
  });

  test("clicking on page triggers navigation to '/'", () => {
    const { getByTestId } = render(<Default />);
    const div = getByTestId("default-page");

    fireEvent.click(div);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
